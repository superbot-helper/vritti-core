import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/site/purchase-orders/keys';
import { removeGoodsReceiptLot } from '@/services/site/goods-receipts.service';
import { GOODS_RECEIPT_KEY } from './keys';

// Removes a lot with its lines and serials; the receipt and the purchase orders refresh
export function useRemoveGoodsReceiptLot(
  goodsReceiptId: string,
  itemId: string,
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: (lotId) => removeGoodsReceiptLot(goodsReceiptId, itemId, lotId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: GOODS_RECEIPT_KEY(goodsReceiptId) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
