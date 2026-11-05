import { LE_INVENTORY_ITEMS } from '@vritti/commerce-permissions/inventory-items';
import { LE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import type { SupplierItemPricesBinding } from '@/components/suppliers/bindings';
import {
  SUPPLIER_ITEM_PRICES_TABLE_KEY,
  useDeleteSupplierItemPrice,
  useSupplierItemPricedSiteIds,
  useSupplierItemPriceHistory,
  useSupplierItemPricesTable,
  useUpdateSupplierItemPrice,
} from '@/hooks/legal-entity/suppliers';

export const pricesBinding: SupplierItemPricesBinding = {
  permissions: { ...LE_SUPPLIERS.items.prices, mrp: LE_INVENTORY_ITEMS.mrp },
  tableKey: SUPPLIER_ITEM_PRICES_TABLE_KEY,
  tableSlug: (_supplierId, itemId) => `commerce-le-supplier-item-${itemId}-prices`,
  usePricesTable: useSupplierItemPricesTable,
  usePriceHistory: useSupplierItemPriceHistory,
  useUpdatePrice: useUpdateSupplierItemPrice,
  useDeletePrice: useDeleteSupplierItemPrice,
  sites: { usePricedSiteIds: useSupplierItemPricedSiteIds },
};
