import { useQuery } from '@tanstack/react-query';
import { ORG_TAX_GROUPS } from '@vritti/commerce-permissions/tax-groups';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { TaxClassGroupsTableResponse } from '@/schemas/tax-groups';
import { getTaxGroupClassesTable } from '@/services/organization/tax-groups.service';
import { TAX_GROUP_CLASSES_TABLE_KEY } from './keys';

// Fetches the tax classes mapped to a tax group; self-gates on the classes view permission
export function useTaxGroupClassesTable(taxGroupId: string) {
  const { available } = usePermission(ORG_TAX_GROUPS.classes.view);
  return useQuery<TaxClassGroupsTableResponse, AxiosError>({
    queryKey: TAX_GROUP_CLASSES_TABLE_KEY(taxGroupId),
    queryFn: () => getTaxGroupClassesTable(taxGroupId),
    enabled: available,
  });
}
