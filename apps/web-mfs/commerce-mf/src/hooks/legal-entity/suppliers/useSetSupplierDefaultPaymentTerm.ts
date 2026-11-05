import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { setSupplierDefaultPaymentTerm } from '@/services/legal-entity/suppliers.service';
import { SUPPLIER_KEY, SUPPLIERS_TABLE_KEY } from './keys';

export interface SetSupplierDefaultPaymentTermPayload {
  id: string;
  defaultPaymentTermId: string;
}

// Sets a supplier's default payment term and refreshes the table and the supplier
export function useSetSupplierDefaultPaymentTerm(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, SetSupplierDefaultPaymentTermPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, AxiosError, SetSupplierDefaultPaymentTermPayload>({
    ...options,
    mutationFn: setSupplierDefaultPaymentTerm,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEY(args[1].id) });
      options?.onSuccess?.(...args);
    },
  });
}
