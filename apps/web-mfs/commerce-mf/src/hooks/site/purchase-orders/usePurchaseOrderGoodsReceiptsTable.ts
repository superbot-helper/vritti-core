import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { SITE_PURCHASE_ORDERS } from '@vritti/commerce-permissions/purchase-orders';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { GoodsReceiptsTableResponse } from '@/schemas/goods-receipts';
import { getPurchaseOrderGoodsReceiptsTable } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDER_GOODS_RECEIPTS_TABLE_KEY } from './keys';

// Fetches the goods receipts counted against a purchase order; self-gates on the view permission
export function usePurchaseOrderGoodsReceiptsTable(
  id: string,
  options?: Omit<UseQueryOptions<GoodsReceiptsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(SITE_PURCHASE_ORDERS.view);
  return useQuery<GoodsReceiptsTableResponse, AxiosError>({
    queryKey: PURCHASE_ORDER_GOODS_RECEIPTS_TABLE_KEY(id),
    queryFn: () => getPurchaseOrderGoodsReceiptsTable(id),
    ...options,
    enabled: available && (options?.enabled ?? true),
  });
}
