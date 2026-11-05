import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { LE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { SupplierEnrollmentsTableResponse } from '@/schemas/supplier-enrollments';
import { getSupplierEnrollmentsTable } from '@/services/legal-entity/supplier-enrollments.service';
import { SUPPLIER_ENROLLMENTS_TABLE_KEY } from './keys';

// Fetches every site of the legal entity with the supplier's enrollment there; self-gates on the sites view permission
export function useSupplierEnrollmentsTable(
  supplierId: string | undefined,
  options?: Omit<UseQueryOptions<SupplierEnrollmentsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(LE_SUPPLIERS.sites.view);
  return useQuery<SupplierEnrollmentsTableResponse, AxiosError>({
    queryKey: SUPPLIER_ENROLLMENTS_TABLE_KEY(supplierId ?? ''),
    queryFn: () => getSupplierEnrollmentsTable(supplierId as string),
    ...options,
    enabled: !!supplierId && available && (options?.enabled ?? true),
  });
}
