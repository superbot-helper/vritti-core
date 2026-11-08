import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, eq, getColumns, ne, sql } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk/exceptions';
import type { CurrencyAmountDto } from '@vritti/api-sdk/money';
import {
  inventoryItems,
  purchaseOrderItems,
  type SupplierInvoiceLine,
  SupplierInvoiceStatusValues,
  supplierInvoiceLineReceipts,
  supplierInvoiceLines,
  supplierInvoices,
  uom,
} from '@/db/schema';

export type SupplierInvoiceLineRow = SupplierInvoiceLine & {
  inventoryItemName: string;
  uomSymbol: string | null;
};

export type SupplierInvoiceLineFlagsRow = Pick<
  SupplierInvoiceLine,
  'supplierInvoiceId' | 'purchaseOrderItemId' | 'lotNumber' | 'flags'
>;

export type InvoicedPurchaseOrderItem = {
  id: string;
  inventoryItemId: string;
  uomId: string;
  inventoryItemName: string;
};

export type SupplierInvoiceLineMatchRow = Pick<
  SupplierInvoiceLine,
  | 'id'
  | 'supplierInvoiceId'
  | 'purchaseOrderItemId'
  | 'lotNumber'
  | 'expiryDate'
  | 'mrp'
  | 'billedQty'
  | 'freeQty'
  | 'unitPrice'
  | 'flags'
> & {
  invoiceDate: string;
  currencyCode: string;
  orderedQty: number;
  orderedUnitPrice: bigint;
  schemeBuyQty: number | null;
  schemeFreeQty: number | null;
  hasScheme: boolean;
  linkedQty: number;
};

@Injectable()
export class SupplierInvoiceLinesDomainRepository extends PrimaryBaseRepository<typeof supplierInvoiceLines> {
  constructor(database: PrimaryDatabaseService) {
    super(database, supplierInvoiceLines);
  }

  // Returns an invoice's lines in entry order with the item's name and the unit's symbol
  findByInvoice(supplierInvoiceId: string): Promise<SupplierInvoiceLineRow[]> {
    return this.findAllWithSelect<SupplierInvoiceLineRow>({
      select: {
        ...getColumns(supplierInvoiceLines),
        inventoryItemName: inventoryItems.name,
        uomSymbol: uom.symbol,
      },
      innerJoin: { table: inventoryItems, on: eq(inventoryItems.id, supplierInvoiceLines.inventoryItemId) },
      leftJoin: { table: uom, on: eq(uom.id, supplierInvoiceLines.uomId) },
      where: eq(supplierInvoiceLines.supplierInvoiceId, supplierInvoiceId),
      orderBy: [asc(supplierInvoiceLines.createdAt)],
    });
  }

  // Loads a line only when it is on the invoice
  async findByIdOrThrow(supplierInvoiceId: string, id: string): Promise<SupplierInvoiceLine> {
    const line = await this.findById(id, { where: eq(supplierInvoiceLines.supplierInvoiceId, supplierInvoiceId) });
    if (!line) throw new NotFoundException('Invoice line not found.');
    return line;
  }

  // Loads the billed order line, which must be on the order the invoice bills
  async findPurchaseOrderItemOrThrow(
    purchaseOrderId: string,
    purchaseOrderItemId: string,
  ): Promise<InvoicedPurchaseOrderItem> {
    const [item] = await this.db
      .select({
        id: purchaseOrderItems.id,
        inventoryItemId: purchaseOrderItems.inventoryItemId,
        uomId: purchaseOrderItems.uomId,
        inventoryItemName: inventoryItems.name,
      })
      .from(purchaseOrderItems)
      .innerJoin(inventoryItems, eq(inventoryItems.id, purchaseOrderItems.inventoryItemId))
      .where(
        and(eq(purchaseOrderItems.id, purchaseOrderItemId), eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId)),
      )
      .limit(1);
    if (!item) {
      throw new BadRequestException({
        label: 'Order line not found',
        detail: 'The line is not on the purchase order this invoice bills.',
        errors: [{ field: 'purchaseOrderItemId', message: 'Not on this order' }],
      });
    }
    return item;
  }

  // Returns every line of a purchase order's live invoices with its order line's terms and the quantity linked to receipts
  async findForMatch(purchaseOrderId: string): Promise<SupplierInvoiceLineMatchRow[]> {
    const rows = await this.db
      .select({
        id: supplierInvoiceLines.id,
        supplierInvoiceId: supplierInvoiceLines.supplierInvoiceId,
        purchaseOrderItemId: supplierInvoiceLines.purchaseOrderItemId,
        lotNumber: supplierInvoiceLines.lotNumber,
        expiryDate: supplierInvoiceLines.expiryDate,
        mrp: supplierInvoiceLines.mrp,
        billedQty: supplierInvoiceLines.billedQty,
        freeQty: supplierInvoiceLines.freeQty,
        unitPrice: supplierInvoiceLines.unitPrice,
        flags: supplierInvoiceLines.flags,
        invoiceDate: supplierInvoices.invoiceDate,
        currencyCode: supplierInvoices.currencyCode,
        orderedQty: purchaseOrderItems.uomQty,
        orderedUnitPrice: purchaseOrderItems.unitPrice,
        schemeBuyQty: purchaseOrderItems.schemeBuyQty,
        schemeFreeQty: purchaseOrderItems.schemeFreeQty,
        hasScheme: purchaseOrderItems.hasScheme,
        linkedQty: sql<number>`(${this.db
          .select({ total: sql`coalesce(sum(${supplierInvoiceLineReceipts.quantity}), 0)` })
          .from(supplierInvoiceLineReceipts)
          .where(eq(supplierInvoiceLineReceipts.supplierInvoiceLineId, supplierInvoiceLines.id))})`.mapWith(Number),
      })
      .from(supplierInvoiceLines)
      .innerJoin(supplierInvoices, eq(supplierInvoices.id, supplierInvoiceLines.supplierInvoiceId))
      .innerJoin(purchaseOrderItems, eq(purchaseOrderItems.id, supplierInvoiceLines.purchaseOrderItemId))
      .where(
        and(
          eq(supplierInvoices.purchaseOrderId, purchaseOrderId),
          ne(supplierInvoices.status, SupplierInvoiceStatusValues.CANCELLED),
        ),
      );
    return rows as SupplierInvoiceLineMatchRow[];
  }

  // Returns the flagged lines of a purchase order's live invoices in line order
  findFlaggedForPurchaseOrder(purchaseOrderId: string): Promise<SupplierInvoiceLineFlagsRow[]> {
    return this.db
      .select({
        supplierInvoiceId: supplierInvoiceLines.supplierInvoiceId,
        purchaseOrderItemId: supplierInvoiceLines.purchaseOrderItemId,
        lotNumber: supplierInvoiceLines.lotNumber,
        flags: supplierInvoiceLines.flags,
      })
      .from(supplierInvoiceLines)
      .innerJoin(supplierInvoices, eq(supplierInvoices.id, supplierInvoiceLines.supplierInvoiceId))
      .where(
        and(
          eq(supplierInvoices.purchaseOrderId, purchaseOrderId),
          ne(supplierInvoices.status, SupplierInvoiceStatusValues.CANCELLED),
          ne(supplierInvoiceLines.flags, []),
        ),
      )
      .orderBy(asc(supplierInvoiceLines.createdAt));
  }

  // Every amount on a line is in the invoice's currency, which is the order's
  assertAmountsInCurrency(amounts: Record<string, CurrencyAmountDto | null | undefined>, currencyCode: string): void {
    const foreignField = Object.keys(amounts).find((field) => {
      const amount = amounts[field];
      return amount != null && amount.currency !== currencyCode;
    });
    if (!foreignField) return;
    throw new BadRequestException({
      label: 'Wrong currency',
      detail: `The invoice is in ${currencyCode}; enter every amount on its lines in ${currencyCode}.`,
      errors: [{ field: foreignField, message: `Must be in ${currencyCode}` }],
    });
  }

  // A discount takes off at most what the line bills before tax
  assertDiscountWithinGross(grossAmount: bigint, discountAmount: bigint): void {
    if (discountAmount <= grossAmount) return;
    throw new BadRequestException({
      label: 'Discount too large',
      detail: 'The discount is more than the billed quantity times the unit price.',
      errors: [{ field: 'discountAmount', message: 'More than the billed amount' }],
    });
  }

  // Clears the price variance of every line of an invoice once its costing is reversed
  async clearVariance(supplierInvoiceId: string): Promise<void> {
    await this.updateMany(eq(supplierInvoiceLines.supplierInvoiceId, supplierInvoiceId), { varianceAmount: 0n });
  }
}
