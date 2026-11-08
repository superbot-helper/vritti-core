import Decimal from '@vritti/api-sdk/decimal';
import type { PurchaseOrderInvoiceSummaryRow } from '../../repositories/supplier-invoices.repository';

export class PurchaseOrderInvoiceSummaryDto {
  invoiceCount: number;
  flaggedInvoiceCount: number;
  billedQty: number;
  billedPercent: number;

  static from(row: PurchaseOrderInvoiceSummaryRow): PurchaseOrderInvoiceSummaryDto {
    const dto = new PurchaseOrderInvoiceSummaryDto();
    const billed = new Decimal(row.billedQty);
    const ordered = new Decimal(row.orderedQty);
    dto.invoiceCount = row.invoiceCount;
    dto.flaggedInvoiceCount = row.flaggedInvoiceCount;
    dto.billedQty = billed.toNumber();
    dto.billedPercent = ordered.isZero() ? 0 : billed.div(ordered).times(100).toDecimalPlaces(1).toNumber();
    return dto;
  }
}
