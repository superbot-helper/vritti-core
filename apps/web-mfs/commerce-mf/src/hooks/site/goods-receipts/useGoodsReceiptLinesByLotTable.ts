import { useQuery } from '@tanstack/react-query';
import { SITE_GOODS_RECEIPTS } from '@vritti/commerce-permissions/goods-receipts';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { GoodsReceiptLinesTableResponse } from '@/schemas/goods-receipts';
import { getGoodsReceiptLinesByLotTable } from '@/services/site/goods-receipts.service';
import { GOODS_RECEIPT_LOT_LINES_TABLE_KEY } from './keys';

// Fetches a lot's lines, idle without a lot; self-gates on the view permission
export function useGoodsReceiptLinesByLotTable(id: string, itemId: string, lotId: string | null) {
  const { available } = usePermission(SITE_GOODS_RECEIPTS.view);
  return useQuery<GoodsReceiptLinesTableResponse, AxiosError>({
    queryKey: GOODS_RECEIPT_LOT_LINES_TABLE_KEY(id, itemId, lotId ?? ''),
    queryFn: () => getGoodsReceiptLinesByLotTable(id, itemId, lotId as string),
    enabled: !!lotId && available,
  });
}
