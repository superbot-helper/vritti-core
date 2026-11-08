import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { UpdateGoodsReceiptLinePayload } from '@/schemas/goods-receipts';
import { updateGoodsReceiptLine } from '@/services/legal-entity/goods-receipts.service';
import { GOODS_RECEIPT_KEY } from './keys';

// Updates a line's location or quantity; the receipt and the purchase orders refresh
export function useUpdateGoodsReceiptLine(
  goodsReceiptId: string,
  itemId: string,
  lineId: string,
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateGoodsReceiptLinePayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateGoodsReceiptLinePayload>({
    ...options,
    mutationFn: (data) => updateGoodsReceiptLine(goodsReceiptId, itemId, lineId, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: GOODS_RECEIPT_KEY(goodsReceiptId) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
