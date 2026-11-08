import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { GoodsReceiptItemsCostData } from '@/schemas/goods-receipts';
import { getGoodsReceiptItemsCost } from '@/services/site/goods-receipts.service';
import { GOODS_RECEIPT_ITEMS_COST_KEY } from './keys';

// Fetches the provisional cost of a goods receipt's accepted items
export function useGoodsReceiptItemsCost(id: string) {
  return useQuery<GoodsReceiptItemsCostData, AxiosError>({
    queryKey: GOODS_RECEIPT_ITEMS_COST_KEY(id),
    queryFn: () => getGoodsReceiptItemsCost(id),
  });
}
