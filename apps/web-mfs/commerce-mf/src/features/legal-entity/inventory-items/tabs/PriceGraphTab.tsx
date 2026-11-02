import { LE_INVENTORY_ITEMS } from '@vritti/commerce-permissions/inventory-items';
import { Empty } from '@vritti/quantum-ui/Empty';
import { SelectFilter } from '@vritti/quantum-ui/Select';
import { Store } from 'lucide-react';
import type React from 'react';
import { Suspense } from 'react';
import { ContextFilterSkeleton } from '@/components/ContextFilterSkeleton';
import { ItemSupplierPricesGraph } from '@/components/inventory-items/ItemSupplierPricesGraph';
import {
  useInventoryItemPriceGraph,
  useInventoryItemPriceGraphSiteId,
  useSaveInventoryItemPriceGraph,
} from '@/hooks/legal-entity/inventory-items';

interface PriceGraphTabProps {
  inventoryItemId: string;
}

// The item's price from its suppliers at one site, the site picked from those where it has prices; what it shows is
// saved per user like a table's state
export const PriceGraphTab: React.FC<PriceGraphTabProps> = ({ inventoryItemId }) => {
  const { data: graph, isLoading } = useInventoryItemPriceGraph(inventoryItemId);
  const save = useSaveInventoryItemPriceGraph(inventoryItemId);
  const siteId = graph?.selection.siteId ?? undefined;

  return (
    <ItemSupplierPricesGraph
      graph={graph}
      isLoading={isLoading}
      onSelectionChange={(selection) => save.mutate(selection)}
      optionsEndpointBase={siteId ? `commerce-api/le/inventory-items/${inventoryItemId}/prices/${siteId}` : undefined}
      mrpPermission={LE_INVENTORY_ITEMS.mrp.view}
      filters={
        <Suspense fallback={<ContextFilterSkeleton labelWidth="w-8" valueWidth="w-24" />}>
          <PriceGraphSiteFilter
            inventoryItemId={inventoryItemId}
            onChange={(next) => {
              // Suppliers and MRPs belong to a site, so a new site starts from its own defaults
              if (graph) save.mutate({ ...graph.selection, siteId: next, supplierIds: [], mrpIds: [] });
            }}
          />
        </Suspense>
      }
      emptyState={
        <Empty
          icon={<Store className="size-6" />}
          title={siteId ? 'No prices in this period' : 'No prices yet'}
          description={
            siteId
              ? 'No supplier has a price for this item at the selected site in these dates. Widen the date range.'
              : "No supplier has priced this item at any of this legal entity's sites."
          }
        />
      }
    />
  );
};

interface PriceGraphSiteFilterProps {
  inventoryItemId: string;
  onChange: (siteId: string) => void;
}

// The site the graph is drawn at. Suspends until the graph loads so it always holds a site, and hides while no site has
// a price for the item, when there is nothing to pick between.
const PriceGraphSiteFilter: React.FC<PriceGraphSiteFilterProps> = ({ inventoryItemId, onChange }) => {
  const { data: siteId } = useInventoryItemPriceGraphSiteId(inventoryItemId);
  if (!siteId) return null;

  return (
    <SelectFilter
      name="siteId"
      label="Site"
      placeholder="Select site"
      mode="context"
      clearable={false}
      optionsEndpoint={`commerce-api/le/inventory-items/${inventoryItemId}/prices/sites`}
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      value={siteId}
      onChange={(result) => onChange(String(result.value))}
    />
  );
};
