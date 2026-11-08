import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { LE_PURCHASE_ORDERS } from '@vritti/commerce-permissions/purchase-orders';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { PurchaseOrderProblemsResponse } from '@/schemas/purchase-orders';
import { getPurchaseOrderProblems } from '@/services/legal-entity/purchase-orders.service';
import { PURCHASE_ORDER_PROBLEMS_KEY } from './keys';

// Fetches the problems flagged on a purchase order's receipts and invoices; self-gates on the view permission
export function usePurchaseOrderProblems(
  id: string,
  options?: Omit<UseQueryOptions<PurchaseOrderProblemsResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(LE_PURCHASE_ORDERS.view);
  return useQuery<PurchaseOrderProblemsResponse, AxiosError>({
    queryKey: PURCHASE_ORDER_PROBLEMS_KEY(id),
    queryFn: () => getPurchaseOrderProblems(id),
    ...options,
    enabled: available && (options?.enabled ?? true),
  });
}
