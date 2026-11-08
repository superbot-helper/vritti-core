import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { GoodsReceiptLotData } from '@/schemas/goods-receipts';
import { getGoodsReceiptLots } from '@/services/site/goods-receipts.service';
import { GOODS_RECEIPT_LOTS_KEY } from './keys';

// Fetches the lots of a goods receipt item
export function useGoodsReceiptLots(id: string, itemId: string) {
  return useQuery<GoodsReceiptLotData[], AxiosError>({
    queryKey: GOODS_RECEIPT_LOTS_KEY(id, itemId),
    queryFn: () => getGoodsReceiptLots(id, itemId),
  });
}
