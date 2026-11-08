import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { ChangePurchaseOrderSupplierPayload } from '@/schemas/purchase-orders';
import { changePurchaseOrderSupplier } from '@/services/legal-entity/purchase-orders.service';
import { PURCHASE_ORDER_KEY, PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Moves a draft purchase order to another supplier
export function useChangePurchaseOrderSupplier(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, ChangePurchaseOrderSupplierPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, ChangePurchaseOrderSupplierPayload>({
    ...options,
    mutationFn: changePurchaseOrderSupplier,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.id) });
      options?.onSuccess?.(...args);
    },
  });
}
