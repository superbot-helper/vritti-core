import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { SetPurchaseOrderConversionRatePayload } from '@/schemas/purchase-orders';
import { setPurchaseOrderConversionRate } from '@/services/legal-entity/purchase-orders.service';
import { PURCHASE_ORDER_KEY, PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Sets a purchase order's rate for another of the supplier's currencies
export function useSetPurchaseOrderConversionRate(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, SetPurchaseOrderConversionRatePayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, SetPurchaseOrderConversionRatePayload>({
    ...options,
    mutationFn: setPurchaseOrderConversionRate,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.id) });
      options?.onSuccess?.(...args);
    },
  });
}
