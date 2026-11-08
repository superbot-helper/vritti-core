import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { CreateSupplierInvoicePayload, SupplierInvoice } from '@/schemas/supplier-invoices';
import { createSupplierInvoice } from '@/services/legal-entity/supplier-invoices.service';
import { LE_SUPPLIER_INVOICES_KEY } from './keys';

// Records a draft invoice billing a purchase order and refreshes the legal entity's invoices and purchase orders
export function useCreateSupplierInvoice(
  options?: Omit<UseMutationOptions<SupplierInvoice, AxiosError, CreateSupplierInvoicePayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SupplierInvoice, AxiosError, CreateSupplierInvoicePayload>({
    ...options,
    mutationFn: createSupplierInvoice,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: LE_SUPPLIER_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
