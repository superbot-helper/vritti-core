import { keepPreviousData, useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { LE_INVENTORY_ITEMS } from '@vritti/commerce-permissions/inventory-items';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { InventoryItemMrpTableResponse } from '@/schemas/inventory-item-mrp';
import type { InventoryItemData } from '@/schemas/inventory-items';
import type {
  InventoryItemPriceGraph,
  InventoryItemSuppliersTableResponse,
  ItemSupplierPriceComparisonTableResponse,
  PriceGraphSelection,
} from '@/schemas/suppliers';
import {
  getLeInventoryItem,
  getLeInventoryItemMrpTable,
  getLeInventoryItemPricedSiteIds,
  getLeInventoryItemPriceGraph,
  getLeInventoryItemPricesTable,
  getLeInventoryItemSuppliersTable,
  saveLeInventoryItemPriceGraph,
} from '@/services/legal-entity/inventory-items.service';
import {
  LE_INVENTORY_ITEM_KEY,
  LE_INVENTORY_ITEM_MRP_KEY,
  LE_INVENTORY_ITEM_PRICE_GRAPH_KEY,
  LE_INVENTORY_ITEM_PRICED_SITE_IDS_KEY,
  LE_INVENTORY_ITEM_PRICES_TABLE_KEY,
  LE_INVENTORY_ITEM_SUPPLIERS_TABLE_KEY,
} from './keys';

const ITEM_ID_INDEX = LE_INVENTORY_ITEM_KEY('').length - 1;

export function useInventoryItem(id: string) {
  return useSuspenseQuery<InventoryItemData, AxiosError>({
    queryKey: LE_INVENTORY_ITEM_KEY(id),
    queryFn: () => getLeInventoryItem(id),
  });
}

// The legal entity's suppliers carrying the item; self-gates on the LE view permission
export function useInventoryItemSuppliersTable(inventoryItemId: string) {
  const { available } = usePermission(LE_INVENTORY_ITEMS.view);
  return useQuery<InventoryItemSuppliersTableResponse, AxiosError>({
    queryKey: LE_INVENTORY_ITEM_SUPPLIERS_TABLE_KEY(inventoryItemId),
    queryFn: () => getLeInventoryItemSuppliersTable(inventoryItemId),
    enabled: available && !!inventoryItemId,
  });
}

// The item's MRPs for its data table; keeps the rows on screen while the table state changes, never another item's,
// and self-gates on the LE MRP view permission
export function useInventoryItemMrpTable(inventoryItemId: string) {
  const { available } = usePermission(LE_INVENTORY_ITEMS.mrp.view);
  return useQuery<InventoryItemMrpTableResponse, AxiosError>({
    queryKey: LE_INVENTORY_ITEM_MRP_KEY(inventoryItemId),
    queryFn: () => getLeInventoryItemMrpTable(inventoryItemId),
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[ITEM_ID_INDEX] === inventoryItemId ? previous : undefined,
    enabled: available && !!inventoryItemId,
  });
}

// What the price graph shows, per its saved selection of site, window, suppliers and MRPs; self-gates on the price view
// permission
export function useInventoryItemPriceGraph(inventoryItemId: string) {
  const { available } = usePermission(LE_INVENTORY_ITEMS.prices.view);
  return useQuery<InventoryItemPriceGraph, AxiosError>({
    queryKey: LE_INVENTORY_ITEM_PRICE_GRAPH_KEY(inventoryItemId),
    queryFn: () => getLeInventoryItemPriceGraph(inventoryItemId),
    placeholderData: keepPreviousData,
    enabled: available && !!inventoryItemId,
  });
}

// The site the price graph is saved on, from the same cached query — suspends until it loads, so a site filter never
// renders without its value; null when no site has a price for the item
export function useInventoryItemPriceGraphSiteId(inventoryItemId: string) {
  return useSuspenseQuery<InventoryItemPriceGraph, AxiosError, string | null>({
    queryKey: LE_INVENTORY_ITEM_PRICE_GRAPH_KEY(inventoryItemId),
    queryFn: () => getLeInventoryItemPriceGraph(inventoryItemId),
    select: (graph) => graph.selection.siteId,
  });
}

// Saves a new graph selection; the controls take it at once, then the graph refetches
export function useSaveInventoryItemPriceGraph(inventoryItemId: string) {
  const queryClient = useQueryClient();
  const queryKey = LE_INVENTORY_ITEM_PRICE_GRAPH_KEY(inventoryItemId);
  return useMutation<void, AxiosError, PriceGraphSelection>({
    mutationFn: (selection) => saveLeInventoryItemPriceGraph(inventoryItemId, selection),
    onMutate: (selection) => {
      queryClient.setQueryData<InventoryItemPriceGraph>(queryKey, (graph) => (graph ? { ...graph, selection } : graph));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

// Every supplier's standing for the item at the table's context site on a day; keeps the rows on screen while the day,
// filters or context change, never another item's, and self-gates on the price view permission
export function useInventoryItemPricesTable(inventoryItemId: string, asOf: string) {
  const { available } = usePermission(LE_INVENTORY_ITEMS.prices.view);
  return useQuery<ItemSupplierPriceComparisonTableResponse, AxiosError>({
    queryKey: [...LE_INVENTORY_ITEM_PRICES_TABLE_KEY(inventoryItemId), asOf],
    queryFn: () => getLeInventoryItemPricesTable(inventoryItemId, asOf),
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[ITEM_ID_INDEX] === inventoryItemId ? previous : undefined,
    enabled: available && !!inventoryItemId,
  });
}

// The sites where any supplier has priced the item, in the site picker's order; self-gates on the price view permission
export function useInventoryItemPricedSiteIds(inventoryItemId: string) {
  const { available } = usePermission(LE_INVENTORY_ITEMS.prices.view);
  return useQuery<string[], AxiosError>({
    queryKey: LE_INVENTORY_ITEM_PRICED_SITE_IDS_KEY(inventoryItemId),
    queryFn: () => getLeInventoryItemPricedSiteIds(inventoryItemId),
    enabled: available && !!inventoryItemId,
  });
}
