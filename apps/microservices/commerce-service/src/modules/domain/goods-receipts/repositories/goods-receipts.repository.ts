import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, exists, getColumns, notExists, or, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk/exceptions';
import {
  type GoodsReceipt,
  GoodsReceiptStatusValues,
  goodsReceiptItems,
  goodsReceiptLines,
  goodsReceiptNumberSeq,
  goodsReceipts,
  parties,
  purchaseOrders,
  suppliers,
} from '@/db/schema';

export type GoodsReceiptRow = GoodsReceipt & {
  supplierName: string | null;
  poNumber: string;
  poOrderDate: string;
  poExpectedBy: string | null;
  poTotalAmount: bigint;
  poCurrencyCode: string;
  poTimezone: string;
  itemCount: number;
  isPublishable: boolean;
};

@Injectable()
export class GoodsReceiptsDomainRepository extends PrimaryBaseRepository<typeof goodsReceipts> {
  constructor(database: PrimaryDatabaseService) {
    super(database, goodsReceipts, { sequence: goodsReceiptNumberSeq });
  }

  // Generates the next sequential GR number for the current month
  async generateGrNumber(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextNumber = await this.nextSequenceValue();
    return `GR-${yearMonth}-${String(nextNumber).padStart(4, '0')}`;
  }

  // Loads a receipt with its supplier, purchase order and publish readiness, throwing when it is out of reach
  async findDetailOrThrow(id: string): Promise<GoodsReceiptRow> {
    const row = await this.findById<GoodsReceiptRow>(id, { select: this.selection(), leftJoins: this.joins() });
    if (!row) throw new NotFoundException('Goods receipt not found.');
    return row;
  }

  // Loads a receipt that is still a draft — the only state whose items, lots and lines may change
  async findDraftOrThrow(id: string, label: string): Promise<GoodsReceiptRow> {
    const receipt = await this.findDetailOrThrow(id);
    if (receipt.status === GoodsReceiptStatusValues.DRAFT) return receipt;
    throw new BadRequestException({
      label,
      detail: `"${receipt.grNumber}" is published, so it can no longer change.`,
    });
  }

  // Returns one page of receipts with their supplier, purchase order and publish readiness
  async findForTable(options: {
    where?: SQL;
    orderBy: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: GoodsReceiptRow[]; count: number }> {
    return this.findAllAndCount<GoodsReceiptRow>({ select: this.selection(), leftJoins: this.joins(), ...options });
  }

  // Returns up to limit + 1 receipts after a cursor, for the mobile feed
  async findKeysetForFeed(options: {
    where?: SQL;
    orderBy: SQL[];
    limit: number;
  }): Promise<{ rows: GoodsReceiptRow[]; hasMore: boolean }> {
    return this.findKeyset<GoodsReceiptRow>({ select: this.selection(), leftJoins: this.joins(), ...options });
  }

  // Rejects publishing a receipt until every item's accepted quantity is fully distributed to balanced lines
  assertPublishable(receipt: GoodsReceiptRow): void {
    if (receipt.isPublishable) return;
    throw new BadRequestException({
      label: 'Not Ready to Publish',
      detail:
        receipt.itemCount === 0
          ? `Add at least one item to "${receipt.grNumber}" before publishing it.`
          : 'Distribute the accepted quantity of every item to lines, and finish their serials, before publishing.',
    });
  }

  // Selects a receipt with its supplier name, purchase order, item count and whether it is ready to publish
  private selection() {
    const ownItems = eq(goodsReceiptItems.goodsReceiptId, goodsReceipts.id);
    const itemLines = eq(goodsReceiptLines.goodsReceiptItemId, goodsReceiptItems.id);
    const distributedQuantity = this.db
      .select({ total: sql`coalesce(sum(${goodsReceiptLines.quantity}), 0)` })
      .from(goodsReceiptLines)
      .where(itemLines);
    const unbalancedLine = this.db
      .select({ id: goodsReceiptLines.id })
      .from(goodsReceiptLines)
      .where(and(itemLines, eq(goodsReceiptLines.isBalanced, false)));
    const undistributedItem = this.db
      .select({ id: goodsReceiptItems.id })
      .from(goodsReceiptItems)
      .where(
        and(
          ownItems,
          or(
            sql`(${distributedQuantity}) <> ${goodsReceiptItems.receivedQty} - ${goodsReceiptItems.rejectedQuantity}`,
            exists(unbalancedLine),
          ),
        ),
      );
    const anyItem = this.db.select({ id: goodsReceiptItems.id }).from(goodsReceiptItems).where(ownItems);

    return {
      ...getColumns(goodsReceipts),
      supplierName: parties.displayName,
      poNumber: purchaseOrders.poNumber,
      poOrderDate: purchaseOrders.orderDate,
      poExpectedBy: purchaseOrders.expectedBy,
      poTotalAmount: purchaseOrders.totalAmount,
      poCurrencyCode: purchaseOrders.currencyCode,
      poTimezone: purchaseOrders.timezone,
      itemCount: this.db.$count(goodsReceiptItems, ownItems),
      isPublishable: sql<boolean>`${and(
        eq(goodsReceipts.status, GoodsReceiptStatusValues.DRAFT),
        exists(anyItem),
        notExists(undistributedItem),
      )}`,
    };
  }

  // Joins the supplier with its party, and the purchase order
  private joins() {
    return [
      { table: suppliers, on: eq(suppliers.id, goodsReceipts.supplierId) },
      { table: parties, on: eq(parties.id, suppliers.partyId) },
      { table: purchaseOrders, on: eq(purchaseOrders.id, goodsReceipts.purchaseOrderId) },
    ];
  }
}
