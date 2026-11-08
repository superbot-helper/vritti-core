import { keepPreviousData, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { LE_GOODS_RECEIPTS } from '@vritti/commerce-permissions/goods-receipts';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { GoodsReceiptsTableResponse } from '@/schemas/goods-receipts';
import { getGoodsReceiptsTable } from '@/services/legal-entity/goods-receipts.service';
import { GOODS_RECEIPTS_TABLE_KEY } from './keys';

// Fetches the goods receipts of the legal entity's sites; self-gates on the view permission
export function useGoodsReceiptsTable(
  options?: Omit<UseQueryOptions<GoodsReceiptsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(LE_GOODS_RECEIPTS.view);
  return useQuery<GoodsReceiptsTableResponse, AxiosError>({
    queryKey: GOODS_RECEIPTS_TABLE_KEY,
    queryFn: getGoodsReceiptsTable,
    placeholderData: keepPreviousData,
    ...options,
    enabled: available && (options?.enabled ?? true),
  });
}
