import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { ChangePurchaseOrderExchangeRatePayload } from '@/schemas/purchase-orders';
import { changePurchaseOrderExchangeRate } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDER_KEY, PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Changes a foreign-currency purchase order's exchange rate
export function useChangePurchaseOrderExchangeRate(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, ChangePurchaseOrderExchangeRatePayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, ChangePurchaseOrderExchangeRatePayload>({
    ...options,
    mutationFn: changePurchaseOrderExchangeRate,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.id) });
      options?.onSuccess?.(...args);
    },
  });
}
