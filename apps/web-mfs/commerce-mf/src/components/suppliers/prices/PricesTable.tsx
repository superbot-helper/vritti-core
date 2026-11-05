import { useQueryClient } from '@tanstack/react-query';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { useConfirm, useWorkspaceTimeZone } from '@vritti/quantum-ui/hooks';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import { isoTodayDate } from '@vritti/quantum-ui/timezone';
import { CalendarClock, Pencil, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContextFilterSkeleton } from '@/components/ContextFilterSkeleton';
import type { SupplierItemPriceRow } from '@/schemas/suppliers';
import { SiteFilter } from '@/selectors/site';
import { isPriceInForce } from '@/utils/supplierPrice';
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
    <PricesTableView {...props} site={props.siteId} />
  );

// The table at one of the sites the item has prices at — the one picked, seeded from `?site=` when opened from an
// enrollment and not saved, else the first in the site picker's order
const PickedSitePricesTable: React.FC<PricesTableProps & { usePricedSiteIds: UsePricedSiteIds }> = ({
  usePricedSiteIds,
  ...props
}) => {
  const [searchParams] = useSearchParams();
  const [picked, setPicked] = useState(() => searchParams.get('site') ?? undefined);
  const { data: siteIds, isLoading } = usePricedSiteIds(props.supplierId, props.itemId);
  const site = picked && siteIds?.includes(picked) ? picked : siteIds?.[0];

  return (
    <PricesTableView
      {...props}
      site={site}
      isSitesLoading={isLoading}
      contextBar={
        isLoading ? (
          <ContextFilterSkeleton labelWidth="w-8" valueWidth="w-24" />
        ) : (
          site && (
            <SiteFilter
              value={site}
              siteIds={siteIds}
              mode="context"
              clearable={false}
              onChange={(result) => setPicked(String(result.value))}
            />
          )
        )
      }
    />
  );
};

interface PricesTableViewProps extends PricesTableProps {
  // The site the rows are at; absent while the item has no prices to pick a site from
  site: string | undefined;
  isSitesLoading?: boolean;
  contextBar?: React.ReactNode;
}

const PricesTableView: React.FC<PricesTableViewProps> = ({
  prices,
  supplierId,
  itemId,
  inventoryItemId,
  uomId,
  currencyCodes,
  addAction,
  site,
  isSitesLoading = false,
  contextBar,
}) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: response, isLoading } = prices.usePricesTable(supplierId, itemId, site);
  const deleteMutation = prices.useDeletePrice(supplierId, itemId);
  const showMrp = usePermission(prices.permissions.mrp.view).available;
  const today = isoTodayDate(useWorkspaceTimeZone(site));

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

  const { table } = useDataTable({
    columns,
    serverState: response,
    slug: prices.tableSlug(supplierId, itemId),
    label: 'price record',
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: prices.tableKey(supplierId, itemId) }),
  });

  return (
    <DataTable
      table={table}
      mode="tab"
      isLoading={isSitesLoading || isLoading}
      permission={prices.permissions.view}
      toolbarActions={{ actions: addAction }}
      contextBar={contextBar}
      emptyStateConfig={{
        icon: CalendarClock,
        title: 'No prices',
        description: "Add a price to start this item's validity-dated timeline.",
        action: addAction,
      }}
    />
  );
};
