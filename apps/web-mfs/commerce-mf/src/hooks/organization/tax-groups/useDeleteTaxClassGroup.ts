import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';

import { deleteTaxClassGroup } from '@/services/organization/tax-groups.service';
import { TAX_CLASS_MAPPING_TABLE_KEY, TAX_GROUP_KEY, TAX_GROUPS_TABLE_KEY } from './keys';

interface Vars {
  taxGroupId: string;
  mappingId: string;
}

// Deletes a tax class mapping and refreshes the group, its classes and the class mapping
export function useDeleteTaxClassGroup(
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: deleteTaxClassGroup,
    onSuccess: (...args) => {
      const [, vars] = args;
      queryClient.invalidateQueries({ queryKey: TAX_GROUP_KEY(vars.taxGroupId) });
      queryClient.invalidateQueries({ queryKey: TAX_GROUPS_TABLE_KEY });
      queryClient.invalidateQueries({ queryKey: TAX_CLASS_MAPPING_TABLE_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
