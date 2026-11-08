import { keepPreviousData, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { ORG_TAX_COMPONENTS } from '@vritti/commerce-permissions/tax-components';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { TaxComponentsTableResponse } from '@/schemas/tax-components';
import { getTaxComponentsTable } from '@/services/organization/tax-components.service';
import { TAX_COMPONENTS_TABLE_KEY } from './keys';

// Fetches the tax components of the country picked in the table's context, every country's when none is picked;
// self-gates on the view permission
export function useTaxComponentsTable(
  options?: Omit<UseQueryOptions<TaxComponentsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(ORG_TAX_COMPONENTS.view);
  return useQuery<TaxComponentsTableResponse, AxiosError>({
    queryKey: TAX_COMPONENTS_TABLE_KEY,
    queryFn: getTaxComponentsTable,
    placeholderData: keepPreviousData,
    ...options,
    enabled: available && (options?.enabled ?? true),
  });
}
