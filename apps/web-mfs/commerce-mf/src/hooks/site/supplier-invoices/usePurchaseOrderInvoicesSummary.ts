import { useQuery } from '@tanstack/react-query';
import { SITE_PURCHASE_ORDERS } from '@vritti/commerce-permissions/purchase-orders';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { PurchaseOrderInvoiceSummary } from '@/schemas/supplier-invoices';
import { getPurchaseOrderInvoicesSummary } from '@/services/site/supplier-invoices.service';
import { SITE_PURCHASE_ORDER_INVOICES_SUMMARY_KEY } from './keys';

// Fetches a purchase order's invoice roll-up; self-gates on the order invoices view permission
export function usePurchaseOrderInvoicesSummary(purchaseOrderId: string) {
  const { available } = usePermission(SITE_PURCHASE_ORDERS.invoices.view);
  return useQuery<PurchaseOrderInvoiceSummary, AxiosError>({
    queryKey: SITE_PURCHASE_ORDER_INVOICES_SUMMARY_KEY(purchaseOrderId),
    queryFn: () => getPurchaseOrderInvoicesSummary(purchaseOrderId),
    enabled: available,
  });
}
