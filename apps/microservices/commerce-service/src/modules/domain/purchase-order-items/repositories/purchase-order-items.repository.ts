import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { aliasedTable, and, asc, eq, getColumns, ne, notExists, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ValidationException,
} from '@vritti/api-sdk/exceptions';
import { type FindForSelectConfig, type SelectQueryResult } from '@vritti/api-sdk/select';
import {
  categories,
  GoodsReceiptStatusValues,
  goodsReceiptItems,
  goodsReceipts,
  inventoryItems,
  type PurchaseOrder,
  type PurchaseOrderItem,
  type PurchaseOrderStatus,
  PurchaseOrderStatusValues,
  purchaseOrderItems,
  uom,
} from '@/db/schema';

const orderUom = aliasedTable(uom, 'order_uom');

export type PurchaseOrderItemRow = PurchaseOrderItem & {
  inventoryItemName: string | null;
  orderUomSymbol: string | null;
  primaryUomSymbol: string | null;
};

export type LinedPurchaseOrder = Pick<PurchaseOrder, 'poNumber' | 'status'> & { hasPublishedGoodsReceipt: boolean };

export type PricedPurchaseOrder = Pick<PurchaseOrder, 'currencyCode' | 'conversionRates'>;

@Injectable()
export class PurchaseOrderItemsDomainRepository extends PrimaryBaseRepository<typeof purchaseOrderItems> {
  private static readonly EDITABLE_STATUSES: PurchaseOrderStatus[] = [
    PurchaseOrderStatusValues.DRAFT,
    PurchaseOrderStatusValues.SENT,
    PurchaseOrderStatusValues.CONFIRMED,
  ];

  constructor(database: PrimaryDatabaseService) {
    super(database, purchaseOrderItems);
  }

  // Returns PO line options for the goods receipt add-item picker, without the lines already on that receipt
  findForSelectByPurchaseOrder(
    purchaseOrderId: string,
    config: FindForSelectConfig,
    excludeOnGoodsReceiptId?: string,
  ): Promise<SelectQueryResult> {
    const conditions: SQL[] = [eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId)];
    if (excludeOnGoodsReceiptId) {
      const onGoodsReceipt = this.db
        .select({ id: goodsReceiptItems.id })
        .from(goodsReceiptItems)
        .where(
          and(
            eq(goodsReceiptItems.goodsReceiptId, excludeOnGoodsReceiptId),
            eq(goodsReceiptItems.purchaseOrderItemId, purchaseOrderItems.id),
          ),
        );
      conditions.push(notExists(onGoodsReceipt));
    }

    return super.findForSelect({
      ...config,
      joins: [
        { table: inventoryItems, on: eq(inventoryItems.id, purchaseOrderItems.inventoryItemId), type: 'inner' },
        { table: categories, on: eq(categories.id, inventoryItems.categoryId), type: 'left' },
        { table: orderUom, on: eq(orderUom.id, purchaseOrderItems.uomId), type: 'left' },
      ],
      groupTable: config.groupIdKey === 'categoryId' ? categories : undefined,
      conditions,
      additionalExpressions: {
        orderedQty: sql`${purchaseOrderItems.uomQty}`,
        expectedFreeQty: sql`${purchaseOrderItems.freeQty}`,
        receivedQty: sql`${purchaseOrderItems.receivedQuantity}`,
        uomSymbol: sql`${orderUom.symbol}`,
        allowDecimal: sql`${orderUom.allowDecimal}`,
      },
    });
  }

  // Returns every line of a PO
  async findByPurchaseOrderId(purchaseOrderId: string): Promise<PurchaseOrderItemRow[]> {
    return this.findAllWithSelect<PurchaseOrderItemRow>({
      select: this.selection(),
      leftJoins: this.joins(),
      where: eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId),
      orderBy: [asc(inventoryItems.name)],
    });
  }

  // Returns one page of a PO's lines
  async findForTable(
    purchaseOrderId: string,
    options: { where?: SQL; orderBy: SQL[]; limit: number; offset: number },
  ): Promise<{ result: PurchaseOrderItemRow[]; count: number }> {
    return this.findAllAndCount<PurchaseOrderItemRow>({
      select: this.selection(),
      leftJoins: this.joins(),
      ...options,
      where: and(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId), options.where),
    });
  }

  // Returns the inventory items ordered on a PO
  async findInventoryItemIds(purchaseOrderId: string): Promise<string[]> {
    const rows = await this.findMany({ where: { purchaseOrderId } });
    return rows.map((row) => row.inventoryItemId);
  }

  // Loads a line of the given PO, throwing when it is not on it
  async findOnPurchaseOrderOrThrow(purchaseOrderId: string, itemId: string): Promise<PurchaseOrderItem> {
    const item = await this.findOne({ id: itemId, purchaseOrderId });
    if (!item) throw new NotFoundException('Purchase order line item not found.');
    return item;
  }

  // Sets each line's received quantity to what its published receipts accepted (received less rejected)
  async syncReceivedQuantities(purchaseOrderId: string): Promise<void> {
    const acceptedOnPublishedReceipts = this.db
      .select({
        accepted: sql`coalesce(sum(${goodsReceiptItems.receivedQty} - ${goodsReceiptItems.rejectedQuantity}), 0)`,
      })
      .from(goodsReceiptItems)
      .innerJoin(goodsReceipts, eq(goodsReceipts.id, goodsReceiptItems.goodsReceiptId))
      .where(
        and(
          eq(goodsReceiptItems.purchaseOrderItemId, purchaseOrderItems.id),
          eq(goodsReceipts.status, GoodsReceiptStatusValues.PUBLISHED),
        ),
      );
    await this.db
      .update(purchaseOrderItems)
      .set({ receivedQuantity: sql`(${acceptedOnPublishedReceipts})` })
      .where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId));
  }

  // Rejects a line change once the PO is past confirmation or one of its receipts is published
  assertLinesEditable(po: LinedPurchaseOrder): void {
    const isEditableStatus = PurchaseOrderItemsDomainRepository.EDITABLE_STATUSES.includes(po.status);
    if (isEditableStatus && !po.hasPublishedGoodsReceipt) return;
    throw new BadRequestException({
      label: 'Cannot Edit Line Items',
      detail: `"${po.poNumber}" is ${po.status} or has a published goods receipt, so its line items are locked.`,
    });
  }

  // Rejects ordering an item in a unit another line of the PO already orders it in
  async assertNotOnPurchaseOrder(
    purchaseOrderId: string,
    line: { inventoryItemId: string; uomId: string },
    field: 'supplierItemId' | 'inventoryItemId',
    excludeItemId?: string,
  ): Promise<void> {
    const isOrdered = await this.exists(
      and(
        eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId),
        eq(purchaseOrderItems.inventoryItemId, line.inventoryItemId),
        eq(purchaseOrderItems.uomId, line.uomId),
        excludeItemId ? ne(purchaseOrderItems.id, excludeItemId) : undefined,
      ) as SQL,
    );
    if (!isOrdered) return;
    throw new ConflictException({
      label: 'Already Ordered',
      detail: 'This item is already on the purchase order in the same unit. Edit that line instead.',
      errors: [{ field, message: 'Already on this order' }],
    });
  }

  // Rejects removing a line, or changing its item, once a goods receipt (draft or published) counts goods against it
  async assertNotOnGoodsReceipt(itemId: string, label: string): Promise<void> {
    const [receiptItem] = await this.db
      .select({ id: goodsReceiptItems.id })
      .from(goodsReceiptItems)
      .where(eq(goodsReceiptItems.purchaseOrderItemId, itemId))
      .limit(1);
    if (!receiptItem) return;
    throw new BadRequestException({
      label,
      detail: 'A goods receipt counts goods against this line. Remove it from the receipt first.',
    });
  }

  // Returns the PO's stored rate into its currency for a price quoted in another of the supplier's currencies
  conversionRateOrThrow(po: PricedPurchaseOrder, currencyCode: string, supplierCurrencies: string[]): string {
    if (!supplierCurrencies.includes(currencyCode)) {
      throw new ValidationException({
        label: 'Currency Not Accepted',
        detail: `The unit price must be in one of the supplier's currencies (${supplierCurrencies.join(', ')}).`,
        errors: [{ field: 'unitPrice', message: "Not one of the supplier's currencies" }],
      });
    }
    const rate = po.conversionRates[currencyCode];
    if (rate) return rate;
    throw new ValidationException({
      label: 'Conversion Rate Required',
      detail: `Enter how much 1 ${currencyCode} is in ${po.currencyCode} to price this line.`,
      errors: [{ field: 'conversionRate', message: `1 ${currencyCode} in ${po.currencyCode}` }],
    });
  }

  // Selects a PO line with its item name, ordered unit symbol and the item's primary unit symbol
  private selection() {
    return {
      ...getColumns(purchaseOrderItems),
      inventoryItemName: inventoryItems.name,
      orderUomSymbol: orderUom.symbol,
      primaryUomSymbol: uom.symbol,
    };
  }

  // Joins the inventory item, the ordered unit and the item's primary unit
  private joins() {
    return [
      { table: inventoryItems, on: eq(inventoryItems.id, purchaseOrderItems.inventoryItemId) },
      { table: orderUom, on: eq(orderUom.id, purchaseOrderItems.uomId) },
      { table: uom, on: eq(uom.id, inventoryItems.uomId) },
    ];
  }
}
