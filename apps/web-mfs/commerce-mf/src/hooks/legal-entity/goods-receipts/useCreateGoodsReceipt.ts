import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDER_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { CreateGoodsReceiptPayload, GoodsReceiptData } from '@/schemas/goods-receipts';
import { createGoodsReceipt } from '@/services/legal-entity/goods-receipts.service';
import { GOODS_RECEIPTS_TABLE_KEY } from './keys';

// Starts a draft goods receipt against a purchase order; the receipts list and the order's receipts refresh
export function useCreateGoodsReceipt(
  options?: Omit<
    UseMutationOptions<CreateResponse<GoodsReceiptData>, AxiosError, CreateGoodsReceiptPayload>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<GoodsReceiptData>, AxiosError, CreateGoodsReceiptPayload>({
    ...options,
    mutationFn: createGoodsReceipt,
    onSuccess: (...args) => {
      const [, variables] = args;
      queryClient.invalidateQueries({ queryKey: GOODS_RECEIPTS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEY(variables.purchaseOrderId) });
      options?.onSuccess?.(...args);
    },
  });
}
