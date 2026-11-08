import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { RemoveSupplierInvoiceLineVars } from '@/schemas/supplier-invoices';
import { removeSupplierInvoiceLine } from '@/services/legal-entity/supplier-invoices.service';
import { LE_SUPPLIER_INVOICES_KEY } from './keys';

// Removes a line from an invoice and refreshes the legal entity's invoices and purchase orders
export function useRemoveSupplierInvoiceLine(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, RemoveSupplierInvoiceLineVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, RemoveSupplierInvoiceLineVars>({
    ...options,
    mutationFn: removeSupplierInvoiceLine,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: LE_SUPPLIER_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
