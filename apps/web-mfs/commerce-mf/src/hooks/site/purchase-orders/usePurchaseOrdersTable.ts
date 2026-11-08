import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { SITE_PURCHASE_ORDERS } from '@vritti/commerce-permissions/purchase-orders';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { PurchaseOrdersTableResponse } from '@/schemas/purchase-orders';
import { getPurchaseOrdersTable } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Fetches the site's purchase orders; self-gates on the view permission
export function usePurchaseOrdersTable(
  options?: Omit<UseQueryOptions<PurchaseOrdersTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(SITE_PURCHASE_ORDERS.view);
  return useQuery<PurchaseOrdersTableResponse, AxiosError>({
    queryKey: PURCHASE_ORDERS_TABLE_KEY,
    queryFn: getPurchaseOrdersTable,
    ...options,
    enabled: available && (options?.enabled ?? true),
  });
}
