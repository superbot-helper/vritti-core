import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { BulkSetSupplierSiteItemPreferredPayload } from '@/schemas/suppliers';
import { bulkSetSupplierSiteItemPreferred } from '@/services/legal-entity/suppliers.service';
import { SUPPLIER_KEY } from './keys';

export function useBulkSetSupplierSiteItemPreferred(
  supplierId: string,
  options?: Omit<
    UseMutationOptions<SuccessResponse, AxiosError, BulkSetSupplierSiteItemPreferredPayload>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, AxiosError, BulkSetSupplierSiteItemPreferredPayload>({
    ...options,
    mutationFn: (payload) => bulkSetSupplierSiteItemPreferred({ supplierId, ...payload }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEY(supplierId) });
      options?.onSuccess?.(...args);
    },
  });
}
