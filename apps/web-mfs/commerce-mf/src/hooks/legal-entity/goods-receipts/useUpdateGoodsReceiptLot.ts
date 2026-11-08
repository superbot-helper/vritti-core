import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { UpdateGoodsReceiptLotPayload } from '@/schemas/goods-receipts';
import { updateGoodsReceiptLot } from '@/services/legal-entity/goods-receipts.service';
import { GOODS_RECEIPT_KEY } from './keys';

// Updates a lot's number, dates or MRP; the receipt and the purchase orders refresh
export function useUpdateGoodsReceiptLot(
  goodsReceiptId: string,
  itemId: string,
  lotId: string,
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateGoodsReceiptLotPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateGoodsReceiptLotPayload>({
    ...options,
    mutationFn: (data) => updateGoodsReceiptLot(goodsReceiptId, itemId, lotId, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: GOODS_RECEIPT_KEY(goodsReceiptId) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
