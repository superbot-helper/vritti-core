import axios from '@vritti/quantum-ui/axios';
import type { InventoryItemMrpTableResponse } from '@/schemas/inventory-item-mrp';
import type { InventoryItemData, InventoryItemTableResponse } from '@/schemas/inventory-items';
import type {
  InventoryItemPriceGraph,
  InventoryItemSuppliersTableResponse,
  ItemSupplierPriceComparisonTableResponse,
  PriceGraphSelection,
} from '@/schemas/suppliers';
import { priceGraphState } from '@/utils/supplierPrice';

const BASE = 'commerce-api/le/inventory-items';

export function getLeInventoryItemsTable(): Promise<InventoryItemTableResponse> {
  return axios.get<InventoryItemTableResponse>(`${BASE}/table`).then((r) => r.data);
}

export function getLeInventoryItem(id: string): Promise<InventoryItemData> {
  return axios.get<InventoryItemData>(`${BASE}/${id}`, { showSuccessToast: false }).then((r) => r.data);
}

export function getLeInventoryItemSuppliersTable(id: string): Promise<InventoryItemSuppliersTableResponse> {
  return axios
    .get<InventoryItemSuppliersTableResponse>(`${BASE}/${id}/suppliers/table`, { showSuccessToast: false })
    .then((r) => r.data);
}

export function getLeInventoryItemMrpTable(id: string): Promise<InventoryItemMrpTableResponse> {
  return axios.get<InventoryItemMrpTableResponse>(`${BASE}/${id}/mrp/table`).then((r) => r.data);
}

export function getLeInventoryItemPriceGraph(id: string): Promise<InventoryItemPriceGraph> {
  return axios
    .get<InventoryItemPriceGraph>(`${BASE}/${id}/prices/graph`, { showSuccessToast: false })
    .then((r) => r.data);
}

// Fetches every supplier's standing for the item at the site in the table's context, on a YYYY-MM-DD day
export function getLeInventoryItemPricesTable(
  id: string,
  asOf: string,
): Promise<ItemSupplierPriceComparisonTableResponse> {
  return axios
    .get<ItemSupplierPriceComparisonTableResponse>(`${BASE}/${id}/prices/table`, {
      params: { asOf },
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Fetches the sites where any supplier has priced the item, in the site picker's order
export function getLeInventoryItemPricedSiteIds(id: string): Promise<string[]> {
  return axios
    .get<{ siteIds: string[] }>(`${BASE}/${id}/prices/site-ids`, { showSuccessToast: false })
    .then((r) => r.data.siteIds);
}

// Saves what the price graph shows to its live table state, which the graph endpoint reads back
export function saveLeInventoryItemPriceGraph(id: string, selection: PriceGraphSelection): Promise<void> {
  return axios
    .post(
      'table-states',
      {
        tableSlug: `commerce-le-inventory-item-${id}-price-graph`,
        state: priceGraphState(selection),
        activeViewId: null,
      },
      { showSuccessToast: false },
    )
    .then(() => undefined);
}
