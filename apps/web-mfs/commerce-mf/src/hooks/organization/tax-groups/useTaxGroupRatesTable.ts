import { useQuery } from '@tanstack/react-query';
import { ORG_TAX_GROUPS } from '@vritti/commerce-permissions/tax-groups';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { TaxGroupRatesContext, TaxGroupRatesTableResponse } from '@/schemas/tax-groups';
import { getTaxGroupRatesTable } from '@/services/organization/tax-groups.service';
import { TAX_GROUP_RATES_TABLE_KEY } from './keys';

// Fetches a tax group's dated rates, narrowed by the state and day picked in the table's context; self-gates on the
// rates view permission
export function useTaxGroupRatesTable(taxGroupId: string, context: TaxGroupRatesContext) {
  const { available } = usePermission(ORG_TAX_GROUPS.rates.view);
  return useQuery<TaxGroupRatesTableResponse, AxiosError>({
    queryKey: [...TAX_GROUP_RATES_TABLE_KEY(taxGroupId), context],
    queryFn: () => getTaxGroupRatesTable(taxGroupId, context),
    enabled: available,
  });
}
