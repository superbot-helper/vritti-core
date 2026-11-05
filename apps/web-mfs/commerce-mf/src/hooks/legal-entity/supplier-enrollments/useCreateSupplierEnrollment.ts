import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { SUPPLIER_KEY } from '@/hooks/legal-entity/suppliers/keys';
import type { CreateSupplierEnrollmentPayload, SupplierEnrollment } from '@/schemas/supplier-enrollments';
import { createSupplierEnrollment } from '@/services/legal-entity/supplier-enrollments.service';

// Enrolls a supplier at a site and refreshes the supplier subtree
export function useCreateSupplierEnrollment(
  options?: Omit<UseMutationOptions<SupplierEnrollment, AxiosError, CreateSupplierEnrollmentPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SupplierEnrollment, AxiosError, CreateSupplierEnrollmentPayload>({
    ...options,
    mutationFn: createSupplierEnrollment,
    onSuccess: (result, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEY(variables.supplierId) });
      options?.onSuccess?.(result, variables, ...rest);
    },
  });
}
