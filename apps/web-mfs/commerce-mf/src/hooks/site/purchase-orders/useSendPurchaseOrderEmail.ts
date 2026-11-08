import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { SendPurchaseOrderEmailPayload } from '@/schemas/purchase-orders';
import { sendPurchaseOrderEmail } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDER_KEY, PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Emails a purchase order to its supplier
export function useSendPurchaseOrderEmail(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, SendPurchaseOrderEmailPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, SendPurchaseOrderEmailPayload>({
    ...options,
    mutationFn: sendPurchaseOrderEmail,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.id) });
      options?.onSuccess?.(...args);
    },
  });
}
