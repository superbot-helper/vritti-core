import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { TaxGroupData } from '@/schemas/tax-groups';
import { getTaxGroup } from '@/services/organization/tax-groups.service';
import { TAX_GROUP_KEY } from './keys';

// Fetches one tax group for its detail page, suspending until it arrives
export function useTaxGroup(id: string) {
  return useSuspenseQuery<TaxGroupData, AxiosError>({
    queryKey: TAX_GROUP_KEY(id),
    queryFn: () => getTaxGroup(id),
  });
}
