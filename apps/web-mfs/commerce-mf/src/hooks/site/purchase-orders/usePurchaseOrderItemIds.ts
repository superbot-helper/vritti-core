import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getPurchaseOrderItemIds } from '@/services/site/purchase-orders.service';
import { PURCHASE_ORDER_ITEMS_IDS_KEY } from './keys';

// Fetches the inventory items ordered on a purchase order
export function usePurchaseOrderItemIds(id: string) {
  return useSuspenseQuery<string[], AxiosError>({
    queryKey: PURCHASE_ORDER_ITEMS_IDS_KEY(id),
    queryFn: () => getPurchaseOrderItemIds(id),
  });
}
