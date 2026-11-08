import { useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  DataTable,
  type DataTableMeta,
  RowActions,
  useDataTable,
  useDataTableStore,
} from '@vritti/quantum-ui/DataTable';
import { filter } from '@vritti/quantum-ui/filter';
import { useConfirm, useWorkspaceTimeZone } from '@vritti/quantum-ui/hooks';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import { isoTodayDate } from '@vritti/quantum-ui/timezone';
import { CalendarClock, Pencil, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContextFilterSkeleton } from '@/components/ContextFilterSkeleton';
import type { SupplierItemPriceRow } from '@/schemas/suppliers';
import { SiteFilter } from '@/selectors/site';
import { contextSiteId, isPriceInForce, pickerSiteIds } from '@/utils/supplierPrice';
import type { SupplierItemPricesBinding } from '../bindings';
import { EditSitePriceDialog } from '../forms/EditSitePriceDialog';
import { supplierPriceColumns } from '../priceColumns';
import type { UsePricedSiteIds } from '../types';

interface PricesTableProps {
  prices: SupplierItemPricesBinding;
  supplierId: string;
  itemId: string;
  inventoryItemId: string;
  uomId: string;
  // Every currency a price may be in
  currencyCodes: string[];
  // The workspace's own site; absent where the table picks one of the sites the item is priced at
  siteId?: string;
  addAction: React.ReactNode;
}

// A supplier item's price timeline at one site, newest first — the workspace's site, or the one picked in the context bar
export const PricesTable: React.FC<PricesTableProps> = (props) =>
  props.prices.sites ? (
    <PickedSitePricesTable {...props} usePricedSiteIds={props.prices.sites.usePricedSiteIds} />
  ) : (
    <PricesTableView {...props} />
  );

// The table at the site in its context — saved with the table, defaulting to the first site the item is priced at in
// the picker's order
const PickedSitePricesTable: React.FC<PricesTableProps & { usePricedSiteIds: UsePricedSiteIds }> = ({
  usePricedSiteIds,
  ...props
}) => {
  const { data: siteIds, isLoading } = usePricedSiteIds(props.supplierId, props.itemId);
  return <PricesTableView {...props} pricedSites={{ siteIds, isLoading }} />;
};

interface PricesTableViewProps extends PricesTableProps {
  // Where the table picks its site: the sites the item is priced at, in the picker's order
  pricedSites?: { siteIds: string[] | undefined; isLoading: boolean };
}

const PricesTableView: React.FC<PricesTableViewProps> = ({
  prices,
  supplierId,
  itemId,
  inventoryItemId,
  uomId,
  currencyCodes,
  addAction,
  siteId,
  pricedSites,
}) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  // A site an enrollment link opened the table at; written into the context once, then dropped from the URL
  const siteParam = pricedSites ? (searchParams.get('site') ?? undefined) : undefined;
  const defaultSite = siteParam ?? pricedSites?.siteIds?.[0];
  const { data: response, isLoading, isFetching } = prices.usePricesTable(supplierId, itemId);
  const deleteMutation = prices.useDeletePrice(supplierId, itemId);
  const showMrp = usePermission(prices.permissions.mrp.view).available;
  const slug = prices.tableSlug(supplierId, itemId);
  const pickedSite = useDataTableStore((state) => contextSiteId(state.tables[slug]?.activeState.filters.context ?? []));
  const today = isoTodayDate(useWorkspaceTimeZone(siteId ?? pickedSite));

  const handleDelete = useCallback(
    async (row: SupplierItemPriceRow) => {
      const confirmed = await confirm({
        title: 'Delete scheduled price?',
        description: 'The previous price re-opens when the windows are contiguous.',
        confirmLabel: 'Delete',
        variant: 'destructive',
      });
      if (confirmed) deleteMutation.mutate(row.id);
    },
    [confirm, deleteMutation],
  );

  const columns = useMemo<ColumnDef<SupplierItemPriceRow>[]>(
    () => [
      ...supplierPriceColumns({ showMrp }),
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const quotationTip = row.original.quotationSiteId
            ? 'Posted by a quotation — change it through the quotation'
            : undefined;
          return (
            <RowActions
              actions={[
                {
                  id: 'edit',
                  icon: Pencil,
                  label: 'Edit',
                  permission: prices.permissions.edit,
                  disabled: !!quotationTip,
                  disabledTip: quotationTip,
                  dialog: {
                    title: 'Edit Price',
                    description: isPriceInForce(row.original, today)
                      ? 'Change the end date of this price.'
                      : 'Update this scheduled price.',
                    content: (close) => (
                      <EditSitePriceDialog
                        useUpdatePrice={prices.useUpdatePrice}
                        mrpPermission={prices.permissions.mrp.edit}
                        supplierId={supplierId}
                        itemId={itemId}
                        inventoryItemId={inventoryItemId}
                        uomId={uomId}
                        currencyCodes={currencyCodes}
                        price={row.original}
                        onSuccess={close}
                        onCancel={close}
                      />
                    ),
                  },
                },
                {
                  id: 'delete',
                  icon: Trash2,
                  label: 'Delete',
                  variant: 'destructive',
                  permission: prices.permissions.delete,
                  hidden: isPriceInForce(row.original, today),
                  disabled: !!quotationTip,
                  disabledTip: quotationTip,
                  onClick: () => handleDelete(row.original),
                },
              ]}
            />
          );
        },
      },
    ],
    [prices, showMrp, today, supplierId, itemId, inventoryItemId, uomId, currencyCodes, handleDelete],
  );

  const { table, isLoaded } = useDataTable({
    columns,
    serverState: response,
    slug,
    label: 'price record',
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: prices.tableKey(supplierId, itemId) }),
    defaultContext: pricedSites && defaultSite ? [filter('site').equals(defaultSite)] : [],
  });

  // A URL site wins over the stored one: written into the context once the stored state has loaded, then dropped
  useEffect(() => {
    if (!siteParam || !isLoaded) return;
    (table.options.meta as DataTableMeta).setContext('site', filter('site').equals(siteParam));
    setSearchParams(
      (params) => {
        params.delete('site');
        return params;
      },
      { replace: true },
    );
  }, [siteParam, isLoaded, table, setSearchParams]);

  const siteOptions = pickerSiteIds(pricedSites?.siteIds ?? [], pickedSite);

  return (
    <DataTable
      table={table}
      mode="tab"
      isLoading={!!pricedSites?.isLoading || isLoading}
      isFetching={isFetching}
      permission={prices.permissions.view}
      toolbarActions={{ actions: addAction }}
      contextBar={
        pricedSites &&
        (pricedSites.isLoading ? (
          <ContextFilterSkeleton labelWidth="w-8" valueWidth="w-24" />
        ) : (
          siteOptions.length > 0 && <SiteFilter name="site" mode="context" siteIds={siteOptions} />
        ))
      }
      emptyStateConfig={{
        icon: CalendarClock,
        title: 'No prices',
        description: "Add a price to start this item's validity-dated timeline.",
        action: addAction,
      }}
    />
  );
};
