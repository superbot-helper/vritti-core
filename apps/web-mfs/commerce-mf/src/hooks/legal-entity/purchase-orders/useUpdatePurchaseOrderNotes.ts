import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdatePurchaseOrderNotesPayload } from '@/schemas/purchase-orders';
import { updatePurchaseOrderNotes } from '@/services/legal-entity/purchase-orders.service';
import { PURCHASE_ORDER_KEY, PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Updates a purchase order's notes
export function useUpdatePurchaseOrderNotes(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdatePurchaseOrderNotesPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdatePurchaseOrderNotesPayload>({
    ...options,
    mutationFn: updatePurchaseOrderNotes,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.id) });
      options?.onSuccess?.(...args);
    },
  });
}
