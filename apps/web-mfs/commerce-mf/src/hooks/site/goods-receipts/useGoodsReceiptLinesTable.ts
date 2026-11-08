import { useQuery } from '@tanstack/react-query';
import { SITE_GOODS_RECEIPTS } from '@vritti/commerce-permissions/goods-receipts';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { GoodsReceiptLinesTableResponse } from '@/schemas/goods-receipts';
import { getGoodsReceiptLinesTable } from '@/services/site/goods-receipts.service';
import { GOODS_RECEIPT_LINES_TABLE_KEY } from './keys';

// Fetches an item's lines, idle without an item; self-gates on the view permission
export function useGoodsReceiptLinesTable(id: string, itemId: string | null) {
  const { available } = usePermission(SITE_GOODS_RECEIPTS.view);
  return useQuery<GoodsReceiptLinesTableResponse, AxiosError>({
    queryKey: GOODS_RECEIPT_LINES_TABLE_KEY(id, itemId ?? ''),
    queryFn: () => getGoodsReceiptLinesTable(id, itemId as string),
    enabled: !!itemId && available,
  });
}
