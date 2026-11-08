import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/site/purchase-orders/keys';
import type { CreateSupplierInvoicePayload, SupplierInvoice } from '@/schemas/supplier-invoices';
import { createSupplierInvoice } from '@/services/site/supplier-invoices.service';
import { SITE_SUPPLIER_INVOICES_KEY } from './keys';

// Records a draft invoice from the supplier and refreshes the site's invoices and purchase orders
export function useCreateSupplierInvoice(
  supplierId: string,
  options?: Omit<UseMutationOptions<SupplierInvoice, AxiosError, CreateSupplierInvoicePayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SupplierInvoice, AxiosError, CreateSupplierInvoicePayload>({
    ...options,
    mutationFn: (data) => createSupplierInvoice(supplierId, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SITE_SUPPLIER_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
