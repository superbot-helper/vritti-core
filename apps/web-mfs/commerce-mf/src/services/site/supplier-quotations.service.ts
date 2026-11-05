import axios from '@vritti/quantum-ui/axios';
import type { SupplierQuotationDetail, SupplierQuotationsTableResponse } from '@/schemas/supplier-quotations';

const base = (supplierId: string) => `commerce-api/site/suppliers/${supplierId}/quotations`;

// Fetches the supplier's quotations posted to the session site
export function getSupplierQuotationsTable(supplierId: string): Promise<SupplierQuotationsTableResponse> {
  return axios
    .get<SupplierQuotationsTableResponse>(`${base(supplierId)}/table`, { showSuccessToast: false })
    .then((r) => r.data);
}

// Fetches a quotation posted to the session site, with its lines
export function getSupplierQuotation(supplierId: string, quotationId: string): Promise<SupplierQuotationDetail> {
  return axios
    .get<SupplierQuotationDetail>(`${base(supplierId)}/${quotationId}`, { showSuccessToast: false })
    .then((r) => r.data);
}
