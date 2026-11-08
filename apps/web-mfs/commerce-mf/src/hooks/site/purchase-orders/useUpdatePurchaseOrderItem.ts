import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdatePurchaseOrderItemPayload } from '@/schemas/purchase-orders';
import { updatePurchaseOrderItem } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDER_KEY, PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Updates a line of a purchase order
export function useUpdatePurchaseOrderItem(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdatePurchaseOrderItemPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdatePurchaseOrderItemPayload>({
    ...options,
    mutationFn: updatePurchaseOrderItem,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.id) });
      options?.onSuccess?.(...args);
    },
  });
}
