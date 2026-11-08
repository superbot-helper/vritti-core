import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { AddGoodsReceiptItemPayload, GoodsReceiptItemData } from '@/schemas/goods-receipts';
import { addGoodsReceiptItem } from '@/services/legal-entity/goods-receipts.service';
import { GOODS_RECEIPT_KEY } from './keys';

// Counts the goods received against one of the purchase order's lines; the receipt and the purchase orders refresh
export function useAddGoodsReceiptItem(
  goodsReceiptId: string,
  options?: Omit<
    UseMutationOptions<CreateResponse<GoodsReceiptItemData>, AxiosError, AddGoodsReceiptItemPayload>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<GoodsReceiptItemData>, AxiosError, AddGoodsReceiptItemPayload>({
    ...options,
    mutationFn: (data) => addGoodsReceiptItem(goodsReceiptId, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: GOODS_RECEIPT_KEY(goodsReceiptId) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
