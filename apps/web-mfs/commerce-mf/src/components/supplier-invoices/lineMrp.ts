import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import Decimal from '@vritti/quantum-ui/decimal';
import type { SupplierInvoiceLine } from '@/schemas/supplier-invoices';

// A line's MRP, or nothing when the invoice did not print one — the API sends a zero for that
export function invoiceLineMrp(line: Pick<SupplierInvoiceLine, 'mrp'>): CurrencyValue | undefined {
  return new Decimal(line.mrp.value).isZero() ? undefined : line.mrp;
}
