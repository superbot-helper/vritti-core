import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/site/purchase-orders/keys';
import type { UpdateSupplierInvoiceVars } from '@/schemas/supplier-invoices';
import { updateSupplierInvoice } from '@/services/site/supplier-invoices.service';
import { SITE_SUPPLIER_INVOICES_KEY } from './keys';

// Updates an invoice's header through its supplier and refreshes the site's invoices and purchase orders
export function useUpdateSupplierInvoice(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateSupplierInvoiceVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateSupplierInvoiceVars>({
    ...options,
    mutationFn: updateSupplierInvoice,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SITE_SUPPLIER_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
