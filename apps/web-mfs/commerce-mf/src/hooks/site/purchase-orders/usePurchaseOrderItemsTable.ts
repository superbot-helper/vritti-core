import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { SITE_PURCHASE_ORDERS } from '@vritti/commerce-permissions/purchase-orders';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { PurchaseOrderItemsTableResponse } from '@/schemas/purchase-orders';
import { getPurchaseOrderItemsTable } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDER_ITEMS_TABLE_KEY } from './keys';

// Fetches a purchase order's lines; self-gates on the view permission
export function usePurchaseOrderItemsTable(
  id: string,
  options?: Omit<UseQueryOptions<PurchaseOrderItemsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(SITE_PURCHASE_ORDERS.view);
  return useQuery<PurchaseOrderItemsTableResponse, AxiosError>({
    queryKey: PURCHASE_ORDER_ITEMS_TABLE_KEY(id),
    queryFn: () => getPurchaseOrderItemsTable(id),
    ...options,
    enabled: available && (options?.enabled ?? true),
  });
}
