import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { SUPPLIER_KEY } from '@/hooks/legal-entity/suppliers/keys';
import type { SetSupplierEnrollmentActiveVars } from '@/schemas/supplier-enrollments';
import { setSupplierEnrollmentActive } from '@/services/legal-entity/supplier-enrollments.service';

// Activates or deactivates a supplier's enrollment at a site and refreshes the supplier subtree
export function useSetSupplierEnrollmentActive(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, SetSupplierEnrollmentActiveVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, SetSupplierEnrollmentActiveVars>({
    ...options,
    mutationFn: setSupplierEnrollmentActive,
    onSuccess: (result, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEY(variables.supplierId) });
      options?.onSuccess?.(result, variables, ...rest);
    },
  });
}
