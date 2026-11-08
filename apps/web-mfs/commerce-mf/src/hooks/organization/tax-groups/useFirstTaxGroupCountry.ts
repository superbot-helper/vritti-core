import { useQuery } from '@tanstack/react-query';
import { ORG_TAX_GROUPS } from '@vritti/commerce-permissions/tax-groups';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import { getFirstTaxGroupCountry } from '@/services/organization/tax-groups.service';
import { TAX_GROUPS_FIRST_COUNTRY_KEY } from './keys';

// Fetches the first country the organization has tax groups in, the one the tax groups page opens on
export function useFirstTaxGroupCountry() {
  const { available } = usePermission(ORG_TAX_GROUPS.view);
  return useQuery<string | null, AxiosError>({
    queryKey: TAX_GROUPS_FIRST_COUNTRY_KEY,
    queryFn: getFirstTaxGroupCountry,
    enabled: available,
  });
}
