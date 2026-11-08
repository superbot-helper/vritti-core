import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { PurchaseOrderItemRef } from '@/schemas/purchase-orders';
import { removePurchaseOrderItem } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDER_KEY, PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Removes a line from a purchase order
export function useRemovePurchaseOrderItem(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, PurchaseOrderItemRef>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, PurchaseOrderItemRef>({
    ...options,
    mutationFn: removePurchaseOrderItem,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.id) });
      options?.onSuccess?.(...args);
    },
  });
}
