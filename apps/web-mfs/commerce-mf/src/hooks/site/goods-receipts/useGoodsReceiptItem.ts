import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { GoodsReceiptItemData } from '@/schemas/goods-receipts';
import { getGoodsReceiptItem } from '@/services/site/goods-receipts.service';
import { GOODS_RECEIPT_ITEM_KEY } from './keys';

// Fetches one goods receipt item with its purchase order counts and flags
export function useGoodsReceiptItem(id: string, itemId: string) {
  return useQuery<GoodsReceiptItemData, AxiosError>({
    queryKey: GOODS_RECEIPT_ITEM_KEY(id, itemId),
    queryFn: () => getGoodsReceiptItem(id, itemId),
  });
}
