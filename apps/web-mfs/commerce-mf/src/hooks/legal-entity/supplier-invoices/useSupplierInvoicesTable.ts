import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LE_SUPPLIER_INVOICES } from '@vritti/commerce-permissions/supplier-invoices';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { SupplierInvoicesTableResponse } from '@/schemas/supplier-invoices';
import { getSupplierInvoicesTable } from '@/services/legal-entity/supplier-invoices.service';
import { LE_SUPPLIER_INVOICES_TABLE_KEY } from './keys';

// Fetches the invoices of the legal entity's sites; self-gates on the view permission
export function useSupplierInvoicesTable() {
  const { available } = usePermission(LE_SUPPLIER_INVOICES.view);
  return useQuery<SupplierInvoicesTableResponse, AxiosError>({
    queryKey: LE_SUPPLIER_INVOICES_TABLE_KEY,
    queryFn: getSupplierInvoicesTable,
    placeholderData: keepPreviousData,
    enabled: available,
  });
}
