import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { SITE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import { SITE_SUPPLIERS_TABLE_KEY } from '@/hooks/site/suppliers/keys';
import type { SupplierEnrollmentsTableResponse } from '@/schemas/supplier-enrollments';
import { getSupplierEnrollmentsTable } from '@/services/site/suppliers.service';

// Fetches every supplier of the legal entity with its enrollment at the session site; self-gates on the view permission
export function useSupplierEnrollmentsTable(
  options?: Omit<UseQueryOptions<SupplierEnrollmentsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(SITE_SUPPLIERS.view);
  return useQuery<SupplierEnrollmentsTableResponse, AxiosError>({
    queryKey: SITE_SUPPLIERS_TABLE_KEY,
    queryFn: getSupplierEnrollmentsTable,
    ...options,
    enabled: available && (options?.enabled ?? true),
  });
}
