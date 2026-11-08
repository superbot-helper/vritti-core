import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { downloadPurchaseOrderPdf } from '@/services/legal-entity/purchase-orders.service';

// Downloads a purchase order's PDF on demand
export function useDownloadPurchaseOrderPdf(
  options?: Omit<UseMutationOptions<Blob, AxiosError, string>, 'mutationFn'>,
) {
  return useMutation<Blob, AxiosError, string>({
    ...options,
    mutationFn: downloadPurchaseOrderPdf,
  });
}
