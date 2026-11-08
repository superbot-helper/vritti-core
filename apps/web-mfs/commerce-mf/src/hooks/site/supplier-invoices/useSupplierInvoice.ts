import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SupplierInvoiceDetail } from '@/schemas/supplier-invoices';
import { getSupplierInvoice } from '@/services/site/supplier-invoices.service';
import { SITE_SUPPLIER_INVOICE_KEY } from './keys';

// Fetches one of the supplier's invoices at the session site, for its page
export function useSupplierInvoice(supplierId: string, invoiceId: string) {
  return useSuspenseQuery<SupplierInvoiceDetail, AxiosError>({
    queryKey: SITE_SUPPLIER_INVOICE_KEY(supplierId, invoiceId),
    queryFn: () => getSupplierInvoice(supplierId, invoiceId),
  });
}
