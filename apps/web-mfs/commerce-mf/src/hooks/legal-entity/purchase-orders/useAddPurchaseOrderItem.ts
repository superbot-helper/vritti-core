import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { AddPurchaseOrderItemPayload, PurchaseOrderData } from '@/schemas/purchase-orders';
import { addPurchaseOrderItem } from '@/services/legal-entity/purchase-orders.service';
import { PURCHASE_ORDER_KEY, PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Adds a line to a purchase order
export function useAddPurchaseOrderItem(
  options?: Omit<
    UseMutationOptions<CreateResponse<PurchaseOrderData>, AxiosError, AddPurchaseOrderItemPayload>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<PurchaseOrderData>, AxiosError, AddPurchaseOrderItemPayload>({
    ...options,
    mutationFn: addPurchaseOrderItem,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.id) });
      options?.onSuccess?.(...args);
    },
  });
}
