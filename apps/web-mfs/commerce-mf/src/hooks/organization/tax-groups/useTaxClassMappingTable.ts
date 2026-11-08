import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ORG_TAX_GROUPS } from '@vritti/commerce-permissions/tax-groups';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { TaxClassMappingTableResponse } from '@/schemas/tax-groups';
import { getTaxClassMappingTable } from '@/services/organization/tax-groups.service';
import { TAX_CLASS_MAPPING_TABLE_KEY } from './keys';

// Fetches every tax class with its tax group today in the country picked in the table's context; self-gates on the
// classes view permission
export function useTaxClassMappingTable() {
  const { available } = usePermission(ORG_TAX_GROUPS.classes.view);
  return useQuery<TaxClassMappingTableResponse, AxiosError>({
    queryKey: TAX_CLASS_MAPPING_TABLE_KEY,
    queryFn: getTaxClassMappingTable,
    placeholderData: keepPreviousData,
    enabled: available,
  });
}
