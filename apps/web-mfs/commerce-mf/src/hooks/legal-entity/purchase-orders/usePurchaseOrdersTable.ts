import { keepPreviousData, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { LE_PURCHASE_ORDERS } from '@vritti/commerce-permissions/purchase-orders';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { PurchaseOrdersTableResponse } from '@/schemas/purchase-orders';
import { getPurchaseOrdersTable } from '@/services/legal-entity/purchase-orders.service';
import { PURCHASE_ORDERS_TABLE_KEY } from './keys';

// Fetches the purchase orders of the legal entity's sites; self-gates on the view permission
export function usePurchaseOrdersTable(
  options?: Omit<UseQueryOptions<PurchaseOrdersTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(LE_PURCHASE_ORDERS.view);
  return useQuery<PurchaseOrdersTableResponse, AxiosError>({
    queryKey: PURCHASE_ORDERS_TABLE_KEY,
    queryFn: getPurchaseOrdersTable,
    placeholderData: keepPreviousData,
    ...options,
    enabled: available && (options?.enabled ?? true),
  });
}
