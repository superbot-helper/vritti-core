import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { GoodsReceiptLineData } from '@/schemas/goods-receipts';
import { getGoodsReceiptLine } from '@/services/site/goods-receipts.service';
import { GOODS_RECEIPT_LINE_KEY } from './keys';

// Fetches one line of a goods receipt item
export function useGoodsReceiptLine(id: string, itemId: string, lineId: string) {
  return useQuery<GoodsReceiptLineData, AxiosError>({
    queryKey: GOODS_RECEIPT_LINE_KEY(id, itemId, lineId),
    queryFn: () => getGoodsReceiptLine(id, itemId, lineId),
  });
}
