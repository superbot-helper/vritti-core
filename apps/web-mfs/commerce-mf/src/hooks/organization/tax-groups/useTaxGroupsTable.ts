import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ORG_TAX_GROUPS } from '@vritti/commerce-permissions/tax-groups';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { TaxGroupsTableResponse } from '@/schemas/tax-groups';
import { getTaxGroupsTable } from '@/services/organization/tax-groups.service';
import { TAX_GROUPS_TABLE_KEY } from './keys';

// Fetches the tax groups of the country picked in the table's context; self-gates on the view permission
export function useTaxGroupsTable() {
  const { available } = usePermission(ORG_TAX_GROUPS.view);
  return useQuery<TaxGroupsTableResponse, AxiosError>({
    queryKey: TAX_GROUPS_TABLE_KEY,
    queryFn: getTaxGroupsTable,
    placeholderData: keepPreviousData,
    enabled: available,
  });
}
