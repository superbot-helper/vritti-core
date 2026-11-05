import {
  keepPreviousData,
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { LE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateSitePriceVars } from '@/components/suppliers/types';
import type {
  SupplierItemPriceHistory,
  SupplierItemPriceRow,
  SupplierItemPricesTableResponse,
} from '@/schemas/suppliers';
import {
  type AddSupplierItemPricePayload,
  addSupplierItemPrice,
  deleteSupplierItemPrice,
  getSupplierItemPricedSiteIds,
  getSupplierItemPriceHistory,
  getSupplierItemPricesTable,
  updateSupplierItemPrice,
} from '@/services/legal-entity/suppliers.service';
import type { PriceRange } from '@/utils/supplierPrice';
import {
  SUPPLIER_ITEM_KEY,
  SUPPLIER_ITEM_PRICE_HISTORY_KEY,
  SUPPLIER_ITEM_PRICED_SITE_IDS_KEY,
  SUPPLIER_ITEM_PRICES_TABLE_KEY,
  SUPPLIER_KEY,
} from './keys';

// Fetches a supplier item's price timeline at the picked site; idle until a site is picked, and self-gates on the prices
// view permission
export function useSupplierItemPricesTable(
  supplierId: string,
  itemId: string,
  site: string | undefined,
  options?: Omit<UseQueryOptions<SupplierItemPricesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const { available } = usePermission(LE_SUPPLIERS.items.prices.view);
  return useQuery<SupplierItemPricesTableResponse, AxiosError>({
    queryKey: [...SUPPLIER_ITEM_PRICES_TABLE_KEY(supplierId, itemId), site],
    queryFn: () => getSupplierItemPricesTable({ supplierId, itemId, site: site ?? '' }),
    placeholderData: keepPreviousData,
    ...options,
    enabled: !!supplierId && !!itemId && !!site && available && (options?.enabled ?? true),
  });
}

// Fetches the sites a supplier item has prices at, in the site picker's order; self-gates on the prices view permission
export function useSupplierItemPricedSiteIds(supplierId: string, itemId: string) {
  const { available } = usePermission(LE_SUPPLIERS.items.prices.view);
  return useQuery<string[], AxiosError>({
    queryKey: SUPPLIER_ITEM_PRICED_SITE_IDS_KEY(supplierId, itemId),
    queryFn: () => getSupplierItemPricedSiteIds(supplierId, itemId),
    enabled: !!supplierId && !!itemId && available,
  });
}

// Fetches a supplier item's price windows in a date range at the given sites — every priced site when none are given;
// self-gates on the prices view permission
export function useSupplierItemPriceHistory(supplierId: string, itemId: string, siteIds: string[], range: PriceRange) {
  const { available } = usePermission(LE_SUPPLIERS.items.prices.view);
  return useQuery<SupplierItemPriceHistory, AxiosError>({
    queryKey: [...SUPPLIER_ITEM_PRICE_HISTORY_KEY(supplierId, itemId), siteIds, range.from, range.to],
    queryFn: () => getSupplierItemPriceHistory({ supplierId, itemId, siteIds, range }),
    placeholderData: keepPreviousData,
    enabled: !!supplierId && !!itemId && available,
  });
}

export function useAddSupplierItemPrice(
  supplierId: string,
  itemId: string,
  options?: Omit<UseMutationOptions<SupplierItemPriceRow[], AxiosError, AddSupplierItemPricePayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SupplierItemPriceRow[], AxiosError, AddSupplierItemPricePayload>({
    ...options,
    mutationFn: (data) => addSupplierItemPrice({ supplierId, itemId, data }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_ITEM_PRICES_TABLE_KEY(supplierId, itemId) });
      queryClient.invalidateQueries({ queryKey: SUPPLIER_ITEM_KEY(supplierId, itemId) });
      options?.onSuccess?.(...args);
    },
  });
}

// A price change refreshes the whole supplier subtree — the item, its timelines and the enrollments' item lists
export function useUpdateSupplierItemPrice(
  supplierId: string,
  itemId: string,
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateSitePriceVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateSitePriceVars>({
    ...options,
    mutationFn: ({ priceId, data }) => updateSupplierItemPrice({ supplierId, itemId, priceId, data }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEY(supplierId) });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteSupplierItemPrice(
  supplierId: string,
  itemId: string,
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: (priceId) => deleteSupplierItemPrice({ supplierId, itemId, priceId }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEY(supplierId) });
      options?.onSuccess?.(...args);
    },
  });
}
