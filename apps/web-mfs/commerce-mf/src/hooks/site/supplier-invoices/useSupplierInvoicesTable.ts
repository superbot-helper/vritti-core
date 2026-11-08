import { useQuery } from '@tanstack/react-query';
import { SITE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { SupplierInvoicesTableResponse } from '@/schemas/supplier-invoices';
import { getSupplierInvoicesTable } from '@/services/site/supplier-invoices.service';
import { SITE_SUPPLIER_INVOICES_TABLE_KEY } from './keys';

// Fetches the supplier's invoices at the session site; self-gates on the supplier invoices view permission
export function useSupplierInvoicesTable(supplierId: string) {
  const { available } = usePermission(SITE_SUPPLIERS.invoices.view);
  return useQuery<SupplierInvoicesTableResponse, AxiosError>({
    queryKey: SITE_SUPPLIER_INVOICES_TABLE_KEY(supplierId),
    queryFn: () => getSupplierInvoicesTable(supplierId),
    enabled: available,
  });
}
