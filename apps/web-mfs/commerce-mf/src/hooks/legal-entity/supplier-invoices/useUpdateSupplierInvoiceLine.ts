import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { PURCHASE_ORDERS_KEY } from '@/hooks/legal-entity/purchase-orders/keys';
import type { UpdateSupplierInvoiceLineVars } from '@/schemas/supplier-invoices';
import { updateSupplierInvoiceLine } from '@/services/legal-entity/supplier-invoices.service';
import { LE_SUPPLIER_INVOICES_KEY } from './keys';

// Updates a line of an invoice and refreshes the legal entity's invoices and purchase orders
export function useUpdateSupplierInvoiceLine(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateSupplierInvoiceLineVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateSupplierInvoiceLineVars>({
    ...options,
    mutationFn: updateSupplierInvoiceLine,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: LE_SUPPLIER_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
