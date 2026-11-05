import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { bulkSetSupplierDefaultPaymentTerm } from '@/services/legal-entity/suppliers.service';
import { SUPPLIERS_KEY } from './keys';

export interface BulkSetSupplierDefaultPaymentTermPayload {
  ids: string[];
  defaultPaymentTermId: string;
}

// Sets the default payment term of several suppliers and refreshes every supplier query
export function useBulkSetSupplierDefaultPaymentTerm(
  options?: Omit<
    UseMutationOptions<SuccessResponse, AxiosError, BulkSetSupplierDefaultPaymentTermPayload>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, AxiosError, BulkSetSupplierDefaultPaymentTermPayload>({
    ...options,
    mutationFn: bulkSetSupplierDefaultPaymentTerm,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
