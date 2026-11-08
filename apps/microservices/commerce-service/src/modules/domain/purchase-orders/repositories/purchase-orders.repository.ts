import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, exists, getColumns, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, NotFoundException, ValidationException } from '@vritti/api-sdk/exceptions';
import {
  GoodsReceiptStatusValues,
  goodsReceipts,
  type PurchaseOrder,
  type PurchaseOrderStatus,
  PurchaseOrderStatusValues,
  parties,
  purchaseOrderItems,
  purchaseOrderNumberSeq,
  purchaseOrders,
  suppliers,
} from '@/db/schema';

export type PurchaseOrderRow = PurchaseOrder & {
  supplierName: string | null;
  itemCount: number;
  hasPublishedGoodsReceipt: boolean;
};

@Injectable()
export class PurchaseOrdersDomainRepository extends PrimaryBaseRepository<typeof purchaseOrders> {
  private static readonly RECEIVABLE_STATUSES: PurchaseOrderStatus[] = [
    PurchaseOrderStatusValues.CONFIRMED,
    PurchaseOrderStatusValues.PARTIALLY_RECEIVED,
  ];

  constructor(database: PrimaryDatabaseService) {
    super(database, purchaseOrders, { sequence: purchaseOrderNumberSeq });
  }

  // Generates the next sequential PO number for the current month
  async generatePoNumber(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextNumber = await this.nextSequenceValue();
    return `PO-${yearMonth}-${String(nextNumber).padStart(4, '0')}`;
  }

  // Loads a PO with its supplier name, line count and receipt state, throwing when it is out of reach
  async findDetailOrThrow(id: string): Promise<PurchaseOrderRow> {
    const row = await this.findById<PurchaseOrderRow>(id, {
      select: this.selection(),
      leftJoins: this.supplierJoins(),
    });
    if (!row) throw new NotFoundException('Purchase order not found.');
    return row;
  }

  // Returns one page of POs with their supplier names, line counts and receipt state
  async findForTable(options: {
    where?: SQL;
    orderBy: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: PurchaseOrderRow[]; count: number }> {
    return this.findAllAndCount<PurchaseOrderRow>({
      select: this.selection(),
      leftJoins: this.supplierJoins(),
      ...options,
    });
  }

  // Recalculates the PO total from the sum of its line totals
  async syncTotalAmount(id: string): Promise<void> {
    const lineTotals = this.db
      .select({ total: sql`coalesce(sum(${purchaseOrderItems.totalPrice}), 0)` })
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, id));
    await this.db
      .update(purchaseOrders)
      .set({ totalAmount: sql`(${lineTotals})` })
      .where(eq(purchaseOrders.id, id));
  }

  // Whether goods can be received against the PO: it is confirmed or partially received
  isReceivable(po: Pick<PurchaseOrder, 'status'>): boolean {
    return PurchaseOrdersDomainRepository.RECEIVABLE_STATUSES.includes(po.status);
  }

  // Rejects a goods receipt against a PO that is not confirmed or partially received
  assertReceivable(po: Pick<PurchaseOrder, 'poNumber' | 'status'>): void {
    if (this.isReceivable(po)) return;
    throw new BadRequestException({
      label: 'Purchase Order Not Open',
      detail: `"${po.poNumber}" is ${po.status}; goods can be received only against a confirmed or partially received order.`,
      errors: [{ field: 'purchaseOrderId', message: `Order is ${po.status}` }],
    });
  }

  // Rejects a change to what the PO's receipts are costed at once one of them is published
  assertPricingUnlocked(po: Pick<PurchaseOrderRow, 'poNumber' | 'hasPublishedGoodsReceipt'>, label: string): void {
    if (!po.hasPublishedGoodsReceipt) return;
    throw new BadRequestException({
      label,
      detail: `A goods receipt of "${po.poNumber}" is published, so its supplier, prices and rates are locked.`,
    });
  }

  // Rejects a supplier change unless the PO is a draft without lines and none of its receipts is published
  assertSupplierChangeable(po: PurchaseOrderRow): void {
    if (po.status !== PurchaseOrderStatusValues.DRAFT) {
      throw new BadRequestException({
        label: 'Cannot Change Supplier',
        detail: 'The supplier can only be changed while the purchase order is a draft.',
      });
    }
    if (po.itemCount > 0) {
      throw new BadRequestException({
        label: 'Cannot Change Supplier',
        detail: 'Remove all line items before changing the supplier.',
      });
    }
    this.assertPricingUnlocked(po, 'Cannot Change Supplier');
  }

  // Returns the rate a PO stores: 1 in the legal entity's own currency, the given one in any other
  resolveExchangeRateOrThrow(currencyCode: string, leCurrencyCode: string, exchangeRate: number | undefined): number {
    if (currencyCode === leCurrencyCode) return 1;
    if (exchangeRate !== undefined) return exchangeRate;
    throw new ValidationException({
      label: 'Exchange Rate Required',
      detail: `The order is in ${currencyCode}; enter how much 1 ${currencyCode} is in ${leCurrencyCode}.`,
      errors: [{ field: 'exchangeRate', message: `1 ${currencyCode} in ${leCurrencyCode}` }],
    });
  }

  // Selects a PO with its supplier name, line count and whether any of its goods receipts is published
  private selection() {
    const publishedGoodsReceipt = this.db
      .select({ id: goodsReceipts.id })
      .from(goodsReceipts)
      .where(
        and(
          eq(goodsReceipts.purchaseOrderId, purchaseOrders.id),
          eq(goodsReceipts.status, GoodsReceiptStatusValues.PUBLISHED),
        ),
      );
    return {
      ...getColumns(purchaseOrders),
      supplierName: parties.displayName,
      itemCount: this.db.$count(purchaseOrderItems, eq(purchaseOrderItems.purchaseOrderId, purchaseOrders.id)),
      hasPublishedGoodsReceipt: sql<boolean>`${exists(publishedGoodsReceipt)}`,
    };
  }

  // Joins the supplier and its party for the supplier name
  private supplierJoins() {
    return [
      { table: suppliers, on: eq(suppliers.id, purchaseOrders.supplierId) },
      { table: parties, on: eq(parties.id, suppliers.partyId) },
    ];
  }
}
