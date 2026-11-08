import type { SupplierInvoiceLineFlag, SupplierInvoiceStatus } from '@/db/schema';
import type { SupplierInvoiceLineFlagsRow } from '../../repositories/supplier-invoice-lines.repository';
import type { SupplierInvoiceRow } from '../../repositories/supplier-invoices.repository';

export class PurchaseOrderInvoiceLineFlagsDto {
  purchaseOrderItemId: string;
  lotNumber: string | null;
  flags: SupplierInvoiceLineFlag[];

  static from(row: SupplierInvoiceLineFlagsRow): PurchaseOrderInvoiceLineFlagsDto {
    const dto = new PurchaseOrderInvoiceLineFlagsDto();
    dto.purchaseOrderItemId = row.purchaseOrderItemId;
    dto.lotNumber = row.lotNumber;
    dto.flags = row.flags;
    return dto;
  }
}

export class PurchaseOrderInvoiceFlagsDto {
  id: string;
  invoiceNumber: string;
  status: SupplierInvoiceStatus;
  flags: SupplierInvoiceLineFlag[];
  lines: PurchaseOrderInvoiceLineFlagsDto[];

  static from(row: SupplierInvoiceRow, lines: SupplierInvoiceLineFlagsRow[]): PurchaseOrderInvoiceFlagsDto {
    const dto = new PurchaseOrderInvoiceFlagsDto();
    dto.id = row.id;
    dto.invoiceNumber = row.invoiceNumber;
    dto.status = row.status;
    dto.flags = row.flags;
    dto.lines = lines.map(PurchaseOrderInvoiceLineFlagsDto.from);
    return dto;
  }
}
