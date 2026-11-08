import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { deletePurchaseOrder } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Deletes a draft purchase order
export function useDeletePurchaseOrder(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: deletePurchaseOrder,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
