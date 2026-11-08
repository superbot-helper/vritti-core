import { useQueryClient } from '@tanstack/react-query';
import { LE_INVENTORY_ITEMS } from '@vritti/commerce-permissions/inventory-items';
import { LE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { Badge } from '@vritti/quantum-ui/Badge';
import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import { type ColumnDef, CurrencyCell, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { DateFilter } from '@vritti/quantum-ui/DateFilter';
import { filter } from '@vritti/quantum-ui/filter';
import { useFormatters, useWorkspaceTimeZone } from '@vritti/quantum-ui/hooks';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import { SelectFilter } from '@vritti/quantum-ui/Select';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { isoTodayDate } from '@vritti/quantum-ui/timezone';
import { Eye, Scale } from 'lucide-react';
import type React from 'react';
import { startTransition, useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ContextFilterSkeleton } from '@/components/ContextFilterSkeleton';
import { PriceTrendChip } from '@/components/suppliers/PriceTrendChip';
import {
  LE_INVENTORY_ITEM_PRICES_TABLE_KEY,
  useInventoryItemPricedSiteIds,
  useInventoryItemPricesTable,
} from '@/hooks/legal-entity/inventory-items';
import type { ItemSupplierPriceComparisonRow } from '@/schemas/suppliers';
import { SiteFilter } from '@/selectors/site';
import { contextSiteId, pickerSiteIds } from '@/utils/supplierPrice';
import { workspaceBase } from '@/utils/workspace';

interface PricesTableTabProps {
  inventoryItemId: string;
  itemName: string;
  // The item's own unit; a price quoted in another unit also shows per this one
  uomSymbol: string | null;
}

const YES_NO = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

// Every supplier's standing for the item at one site on a date (today by default), cheapest per unit first: the price in
// force in its own unit, per the item's primary unit and after its free-goods scheme, and how it last moved
export const PricesTableTab: React.FC<PricesTableTabProps> = ({ inventoryItemId, itemName, uomSymbol }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fmt = useFormatters();
  // The day the table is about — set in its context bar and not saved, since a saved day goes stale
  const timeZone = useWorkspaceTimeZone();
  const [asOf, setAsOf] = useState(() => isoTodayDate(timeZone));
  const { data: response, isLoading, isFetching } = useInventoryItemPricesTable(inventoryItemId, asOf);
  const { data: siteIds, isLoading: isSitesLoading } = useInventoryItemPricedSiteIds(inventoryItemId);
  const showMrp = usePermission(LE_INVENTORY_ITEMS.mrp.view).available;

  // A price per the unit the supplier quotes, and below it per the item's own unit when the two differ — as on a PO line
  const priceLines = useCallback(
    (price: CurrencyValue, quotedUomSymbol: string | null, perItemUnit: CurrencyValue | null) => (
      <>
        <span className="font-mono">
          {fmt.currency(price).primary}
          {quotedUomSymbol && <span className="text-muted-foreground"> / {quotedUomSymbol}</span>}
        </span>
        {perItemUnit && uomSymbol && quotedUomSymbol !== uomSymbol && (
          <span className="font-mono text-xs text-muted-foreground">
            {fmt.currency(perItemUnit).primary} / {uomSymbol}
          </span>
        )}
      </>
    ),
    [fmt, uomSymbol],
  );

  const columns = useMemo<ColumnDef<ItemSupplierPriceComparisonRow>[]>(
    () => [
      {
        accessorKey: 'supplierName',
        header: 'Supplier',
        size: 280,
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.supplierName}</span>,
      },
      {
        accessorKey: 'currentPrice',
        header: 'Price in Force',
        size: 190,
        cell: ({ row }) => {
          const { currentPrice, pricePerPrimary, quotedUomSymbol, currentFrom } = row.original;
          if (!currentPrice) return <span className="text-muted-foreground">None in force</span>;
          return (
            <div className="flex flex-col gap-0.5">
              {priceLines(currentPrice, quotedUomSymbol, pricePerPrimary)}
              {currentFrom && (
                <span className="text-xs text-muted-foreground">since {fmt.date(currentFrom).primary}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'effectivePricePerPrimary',
        header: 'Effective',
        size: 190,
        cell: ({ row }) => {
          const { effectivePrice, effectivePricePerPrimary, quotedUomSymbol, schemeBuyQty, schemeFreeQty } =
            row.original;
          if (!effectivePrice) return '—';
          return (
            <div className="flex flex-col gap-0.5">
              {priceLines(effectivePrice, quotedUomSymbol, effectivePricePerPrimary)}
              <span className="text-xs text-muted-foreground">
                {schemeBuyQty != null && schemeFreeQty != null ? `after ${schemeBuyQty}+${schemeFreeQty}` : 'no scheme'}
              </span>
            </div>
          );
        },
      },
      ...(showMrp
        ? [
            {
              accessorKey: 'mrp',
              header: 'MRP',
              size: 120,
              enableSorting: false,
              cell: ({ row }: { row: { original: ItemSupplierPriceComparisonRow } }) => (
                <CurrencyCell value={row.original.mrp} />
              ),
            } satisfies ColumnDef<ItemSupplierPriceComparisonRow>,
          ]
        : []),
      {
        accessorKey: 'changePercent',
        header: 'Last Change',
        size: 150,
        cell: ({ row }) => {
          const percent = row.original.changePercent;
          if (percent == null) return '—';
          return (
            <PriceTrendChip
              trend={{ direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat', percent: Math.abs(percent) }}
            />
          );
        },
      },
      {
        accessorKey: 'isPreferred',
        header: 'Preferred',
        size: 110,
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.isPreferred ? (
              <Badge variant="success">Preferred</Badge>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                id: 'view',
                icon: Eye,
                label: 'View Supplier Item',
                permission: LE_SUPPLIERS.items.view,
                onClick: () =>
                  navigate(
                    `${workspaceBase(pathname)}/suppliers/${buildSlug(row.original.supplierName, row.original.supplierId)}/items/${buildSlug(itemName, row.original.supplierItemId)}/overview`,
                  ),
              },
            ]}
          />
        ),
      },
    ],
    [showMrp, fmt, priceLines, navigate, pathname, itemName],
  );

  // The site is context saved with the table, defaulting to the first priced site in the picker's order
  const { table, context } = useDataTable({
    columns,
    serverState: response,
    slug: `commerce-le-inventory-item-${inventoryItemId}-prices`,
    label: 'supplier',
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: LE_INVENTORY_ITEM_PRICES_TABLE_KEY(inventoryItemId) }),
    defaultContext: siteIds?.length ? [filter('site').equals(siteIds[0])] : [],
  });
  const siteOptions = pickerSiteIds(siteIds ?? [], contextSiteId(context));

  return (
    <DataTable
      table={table}
      mode="tab"
      isLoading={isLoading || isSitesLoading}
      isFetching={isFetching}
      permission={LE_INVENTORY_ITEMS.prices.view}
      searchConfig={{
        columns: [{ id: 'supplierName', label: 'Supplier name' }],
        searchAll: true,
      }}
      contextBar={
        <>
          {isSitesLoading ? (
            <ContextFilterSkeleton labelWidth="w-8" valueWidth="w-24" />
          ) : (
            siteOptions.length > 0 && <SiteFilter name="site" mode="context" siteIds={siteOptions} />
          )}
          <DateFilter
            name="asOf"
            label="As of"
            mode="context"
            clearable={false}
            value={{ field: 'asOf', operator: 'equals', value: asOf }}
            onChange={(condition) => startTransition(() => setAsOf(condition.value))}
          />
        </>
      }
      filters={[
        <SelectFilter key="inForce" name="inForce" label="Price in Force" options={YES_NO} />,
        <SelectFilter key="isPreferred" name="isPreferred" label="Preferred" options={YES_NO} />,
        <SelectFilter key="hasScheme" name="hasScheme" label="Scheme" options={YES_NO} />,
      ]}
      emptyStateConfig={{
        icon: Scale,
        title: 'No supplier prices',
        description: 'No supplier has priced this item at the selected site. Pick another site in the Site filter.',
      }}
    />
  );
};
