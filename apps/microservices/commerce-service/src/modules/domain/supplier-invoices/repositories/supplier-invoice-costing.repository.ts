import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, inArray, isNull, or, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { type AnyPgColumn, alias } from '@vritti/api-sdk/drizzle-pg-core';
import {
  CostCategoryKindValues,
  CostSourceTypeValues,
  costCategories,
  goodsReceiptItems,
  goodsReceiptLines,
  inventoryItemCosts,
  inventoryItemQuantCosts,
  inventoryItemQuants,
  type NewInventoryItemCost,
  purchaseOrderItems,
  purchaseOrders,
  supplierInvoiceLineReceipts,
  supplierInvoiceLines,
  supplierInvoices,
} from '@/db/schema';

export type CostingSlice = {
  supplierInvoiceLineId: string;
  billedQty: number;
  freeQty: number;
  unitPrice: bigint;
  discountAmount: bigint;
  currencyCode: string;
  exchangeRate: number;
  orderedQty: number;
  orderedPrimaryQty: number;
  expectedFreeQty: number;
  orderedTotalPrice: bigint;
  orderExchangeRate: number;
  linkedQty: number;
  receivedQty: number;
  receivedPrimaryQty: number;
  quantId: string;
  quantQuantity: number;
  quantInflowQty: number;
};

export type QuantVarianceAllocation = {
  quantId: string;
  allocatedAmount: bigint;
};

@Injectable()
export class SupplierInvoiceCostingDomainRepository extends PrimaryBaseRepository<typeof inventoryItemCosts> {
  constructor(database: PrimaryDatabaseService) {
    super(database, inventoryItemCosts);
  }

  // Returns one slice per goods receipt line the invoice's linked receipts put away, with the invoice line, order line and quant facts its costing needs
  async findCostingSlices(supplierInvoiceId: string): Promise<CostingSlice[]> {
    const receiptLines = alias(goodsReceiptLines, 'receipt_lines');
    const quantLines = alias(goodsReceiptLines, 'quant_lines');
    const putAwayByReceipt = (goodsReceiptItemId: AnyPgColumn, goodsReceiptLotId: AnyPgColumn): SQL =>
      and(
        eq(goodsReceiptItemId, supplierInvoiceLineReceipts.goodsReceiptItemId),
        or(
          isNull(supplierInvoiceLineReceipts.goodsReceiptLotId),
          eq(goodsReceiptLotId, supplierInvoiceLineReceipts.goodsReceiptLotId),
        ),
      ) as SQL;

    return this.db
      .select({
        supplierInvoiceLineId: supplierInvoiceLines.id,
        billedQty: supplierInvoiceLines.billedQty,
        freeQty: supplierInvoiceLines.freeQty,
        unitPrice: supplierInvoiceLines.unitPrice,
        discountAmount: supplierInvoiceLines.discountAmount,
        currencyCode: supplierInvoices.currencyCode,
        exchangeRate: supplierInvoices.exchangeRate,
        orderedQty: purchaseOrderItems.uomQty,
        orderedPrimaryQty: purchaseOrderItems.primaryUomQty,
        expectedFreeQty: purchaseOrderItems.freeQty,
        orderedTotalPrice: purchaseOrderItems.totalPrice,
        orderExchangeRate: purchaseOrders.exchangeRate,
        linkedQty: supplierInvoiceLineReceipts.quantity,
        receivedQty: sql<number>`(${this.db
          .select({ total: sql`coalesce(sum(${receiptLines.quantity}), 0)` })
          .from(receiptLines)
          .where(putAwayByReceipt(receiptLines.goodsReceiptItemId, receiptLines.goodsReceiptLotId))})`.mapWith(Number),
        receivedPrimaryQty: goodsReceiptLines.primaryUomQty,
        quantId: inventoryItemQuants.id,
        quantQuantity: inventoryItemQuants.quantity,
        quantInflowQty: sql<number>`(${this.db
          .select({ total: sql`coalesce(sum(${quantLines.primaryUomQty}), 0)` })
          .from(quantLines)
          .where(eq(quantLines.resolvedQuantId, goodsReceiptLines.resolvedQuantId))})`.mapWith(Number),
      })
      .from(supplierInvoiceLines)
      .innerJoin(supplierInvoices, eq(supplierInvoices.id, supplierInvoiceLines.supplierInvoiceId))
      .innerJoin(purchaseOrderItems, eq(purchaseOrderItems.id, supplierInvoiceLines.purchaseOrderItemId))
      .innerJoin(purchaseOrders, eq(purchaseOrders.id, purchaseOrderItems.purchaseOrderId))
      .innerJoin(
        supplierInvoiceLineReceipts,
        eq(supplierInvoiceLineReceipts.supplierInvoiceLineId, supplierInvoiceLines.id),
      )
      .innerJoin(goodsReceiptItems, eq(goodsReceiptItems.id, supplierInvoiceLineReceipts.goodsReceiptItemId))
      .innerJoin(
        goodsReceiptLines,
        putAwayByReceipt(goodsReceiptLines.goodsReceiptItemId, goodsReceiptLines.goodsReceiptLotId),
      )
      .innerJoin(inventoryItemQuants, eq(inventoryItemQuants.id, goodsReceiptLines.resolvedQuantId))
      .where(eq(supplierInvoiceLines.supplierInvoiceId, supplierInvoiceId));
  }

  // Resolves the org's single ITEM-kind cost category, which item costs are booked under
  async findItemCategoryId(): Promise<string | null> {
    const [category] = await this.db
      .select({ id: costCategories.id })
      .from(costCategories)
      .where(eq(costCategories.kind, CostCategoryKindValues.ITEM))
      .limit(1);
    return category?.id ?? null;
  }

  // Moves a quant's cost laid in by the full cost difference and its value by the on-hand share, then re-derives its
  // unit cost from the value per unit left so later outflows carry the revalued cost
  async revalueQuant(quantId: string, costDelta: bigint, onHandDelta: bigint): Promise<void> {
    const revaluedPerUnit = sql`round((${inventoryItemQuants.quantValue} + ${onHandDelta}) / ${inventoryItemQuants.quantity})`;
    await this.db
      .update(inventoryItemQuants)
      .set({
        quantCost: sql`${inventoryItemQuants.quantCost} + ${costDelta}`,
        quantValue: sql`${inventoryItemQuants.quantValue} + ${onHandDelta}`,
        unitCost: sql`case when ${inventoryItemQuants.quantity} > 0 and ${revaluedPerUnit} > 0
          then ${revaluedPerUnit}::bigint else ${inventoryItemQuants.unitCost} end`,
      })
      .where(eq(inventoryItemQuants.id, quantId));
  }

  // Books an invoice's price variance on one goods receipt as a cost header with one allocation per quant, keeping the
  // sum of each quant's allocations equal to its cost laid in
  async recordVariance(cost: NewInventoryItemCost, allocations: QuantVarianceAllocation[]): Promise<void> {
    const header = await this.create(cost);
    await this.db
      .insert(inventoryItemQuantCosts)
      .values(allocations.map((allocation) => ({ ...allocation, costId: header.id })));
  }

  // Removes the price variance an invoice booked, allocations first
  async deleteVariance(supplierInvoiceId: string): Promise<void> {
    const invoiceVariance = and(
      eq(inventoryItemCosts.sourceType, CostSourceTypeValues.SUPPLIER_INVOICE),
      eq(inventoryItemCosts.sourceId, supplierInvoiceId),
    ) as SQL;
    await this.db
      .delete(inventoryItemQuantCosts)
      .where(
        inArray(
          inventoryItemQuantCosts.costId,
          this.db.select({ id: inventoryItemCosts.id }).from(inventoryItemCosts).where(invoiceVariance),
        ),
      );
    await this.deleteMany(invoiceVariance);
  }
}
