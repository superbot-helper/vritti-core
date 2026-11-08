import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { AddGoodsReceiptLineItemPayload, GoodsReceiptLineItemData } from '@/schemas/goods-receipts';
import { addGoodsReceiptLineItem } from '@/services/legal-entity/goods-receipts.service';
import { GOODS_RECEIPT_KEY } from './keys';

// Adds a serial to a line; the receipt and the purchase orders refresh
export function useAddGoodsReceiptLineItem(
  goodsReceiptId: string,
  itemId: string,
  lineId: string,
  options?: Omit<
    UseMutationOptions<CreateResponse<GoodsReceiptLineItemData>, AxiosError, AddGoodsReceiptLineItemPayload>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<GoodsReceiptLineItemData>, AxiosError, AddGoodsReceiptLineItemPayload>({
    ...options,
    mutationFn: (data) => addGoodsReceiptLineItem(goodsReceiptId, itemId, lineId, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: GOODS_RECEIPT_KEY(goodsReceiptId) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
