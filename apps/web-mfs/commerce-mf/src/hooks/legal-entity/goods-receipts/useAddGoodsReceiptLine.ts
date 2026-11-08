import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { AddGoodsReceiptLinePayload, GoodsReceiptLineData } from '@/schemas/goods-receipts';
import { addGoodsReceiptLine } from '@/services/legal-entity/goods-receipts.service';
import { GOODS_RECEIPT_KEY } from './keys';

// Distributes part of an item's accepted quantity to a storage location; the receipt and the purchase orders refresh
export function useAddGoodsReceiptLine(
  goodsReceiptId: string,
  itemId: string,
  options?: Omit<
    UseMutationOptions<CreateResponse<GoodsReceiptLineData>, AxiosError, AddGoodsReceiptLinePayload>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<GoodsReceiptLineData>, AxiosError, AddGoodsReceiptLinePayload>({
    ...options,
    mutationFn: (data) => addGoodsReceiptLine(goodsReceiptId, itemId, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: GOODS_RECEIPT_KEY(goodsReceiptId) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
