import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { TaxJurisdictionCreateResponse, TaxJurisdictionPayload } from '@/schemas/tax-jurisdictions';
import { createTaxJurisdiction } from '@/services/organization/tax-jurisdictions.service';
import { TAX_JURISDICTIONS_KEY } from './keys';

export function useCreateTaxJurisdiction(
  options?: Omit<UseMutationOptions<TaxJurisdictionCreateResponse, AxiosError, TaxJurisdictionPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<TaxJurisdictionCreateResponse, AxiosError, TaxJurisdictionPayload>({
    ...options,
    mutationFn: createTaxJurisdiction,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TAX_JURISDICTIONS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
