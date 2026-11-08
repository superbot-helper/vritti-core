import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { GoodsReceiptTreeNode } from '@/schemas/goods-receipts';
import { getGoodsReceiptTree } from '@/services/legal-entity/goods-receipts.service';
import { GOODS_RECEIPT_TREE_KEY } from './keys';

// Fetches a goods receipt's items with their lots and lines as a tree
export function useGoodsReceiptTree(id: string) {
  return useQuery<GoodsReceiptTreeNode[], AxiosError>({
    queryKey: GOODS_RECEIPT_TREE_KEY(id),
    queryFn: () => getGoodsReceiptTree(id),
  });
}
