import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { SITE_SUPPLIERS_KEY } from '@/hooks/site/suppliers/keys';
import type { SetSupplierEnrollmentActiveVars } from '@/schemas/supplier-enrollments';
import { setSupplierEnrollmentActive } from '@/services/site/suppliers.service';

// Activates or deactivates a supplier's enrollment at the session site and refreshes the site's suppliers
export function useSetSupplierEnrollmentActive(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, SetSupplierEnrollmentActiveVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, SetSupplierEnrollmentActiveVars>({
    ...options,
    mutationFn: setSupplierEnrollmentActive,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SITE_SUPPLIERS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
