import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SupplierDetail } from '@/schemas/suppliers';
import { getSupplier } from '@/services/legal-entity/suppliers.service';
import { SUPPLIER_KEY } from './keys';

// Fetches supplier detail by ID
export function useSupplier(id: string) {
  return useSuspenseQuery<SupplierDetail, AxiosError>({
    queryKey: SUPPLIER_KEY(id),
    queryFn: () => getSupplier(id),
  });
}

// Fetches supplier detail without suspending; idle until a supplier is known
export function useSupplierLookup(id: string | undefined) {
  return useQuery<SupplierDetail, AxiosError>({
    queryKey: SUPPLIER_KEY(id ?? ''),
    queryFn: () => getSupplier(id as string),
    enabled: !!id,
  });
}
