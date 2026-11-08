import { useQuery } from '@tanstack/react-query';
import { SITE_GOODS_RECEIPTS } from '@vritti/commerce-permissions/goods-receipts';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { GoodsReceiptLineItemsTableResponse } from '@/schemas/goods-receipts';
import { getGoodsReceiptLineItemsTable } from '@/services/site/goods-receipts.service';
import { GOODS_RECEIPT_LINE_ITEMS_TABLE_KEY } from './keys';

// Fetches a line's serials; self-gates on the view permission
export function useGoodsReceiptLineItemsTable(id: string, itemId: string, lineId: string) {
  const { available } = usePermission(SITE_GOODS_RECEIPTS.view);
  return useQuery<GoodsReceiptLineItemsTableResponse, AxiosError>({
    queryKey: GOODS_RECEIPT_LINE_ITEMS_TABLE_KEY(id, itemId, lineId),
    queryFn: () => getGoodsReceiptLineItemsTable(id, itemId, lineId),
    enabled: available,
  });
}
