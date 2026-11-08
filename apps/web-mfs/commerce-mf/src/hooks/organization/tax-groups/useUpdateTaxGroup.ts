import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateTaxGroupPayload } from '@/schemas/tax-groups';
import { updateTaxGroup } from '@/services/organization/tax-groups.service';
import { TAX_GROUPS_KEY } from './keys';

interface Vars {
  id: string;
  data: UpdateTaxGroupPayload;
}

// Updates a tax group and refreshes everything that shows its name or treatment
export function useUpdateTaxGroup(options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updateTaxGroup,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TAX_GROUPS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
