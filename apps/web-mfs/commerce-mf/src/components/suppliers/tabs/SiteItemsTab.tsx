import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import {
  type ColumnDef,
  CurrencyCell,
  DataTable,
  NumberCell,
  RowActions,
  StringCell,
  useDataTable,
} from '@vritti/quantum-ui/DataTable';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { ClipboardList, Eye } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SupplierSiteItemData } from '@/schemas/suppliers';
import type { SupplierEnrollmentBinding } from '../bindings';
import { LeadTimeCell } from '../LeadTimeCell';
import type { SupplierEnrollmentRef } from '../types';

interface SiteItemsTabProps {
  binding: SupplierEnrollmentBinding;
  supplierRef: SupplierEnrollmentRef;
}

// The supplier's items set up at the site, read-only; a row opens the item, where its site terms are edited
export const SiteItemsTab: React.FC<SiteItemsTabProps> = ({ binding, supplierRef }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: response, isLoading } = binding.useSiteItemsTable(supplierRef);

  const goToItem = useCallback(
    (item: SupplierSiteItemData) =>
      navigate(binding.siteItemPath(buildSlug(item.inventoryItemName, item.id), supplierRef), { relative: 'path' }),
    [navigate, binding, supplierRef],
  );

  const columns = useMemo<ColumnDef<SupplierSiteItemData>[]>(
    () => [
      {
        accessorKey: 'inventoryItemName',
        header: 'Inventory Item',
        cell: ({ row }) => <StringCell value={row.original.inventoryItemName} />,
      },
      {
        accessorKey: 'supplierItemCode',
        header: 'Supplier Item Code',
        cell: ({ row }) => <StringCell value={row.original.supplierItemCode} />,
      },
      {
        accessorKey: 'uomSymbol',
        header: 'UOM',
        cell: ({ row }) => row.original.uomSymbol,
      },
      {
        accessorKey: 'unitPrice',
        header: 'Unit Price',
        enableSorting: false,
        cell: ({ row }) => <CurrencyCell value={row.original.unitPrice} />,
      },
      {
        accessorKey: 'minOrderQuantity',
        header: 'Min Order',
        cell: ({ row }) =>
          row.original.minOrderQuantity != null ? <NumberCell value={row.original.minOrderQuantity} /> : '—',
      },
      {
        accessorKey: 'leadTimeDays',
        header: 'Lead Time',
        cell: ({ row }) => (
          <LeadTimeCell days={row.original.leadTimeDays} overridden={row.original.isLeadTimeOverridden} />
        ),
      },
      {
        accessorKey: 'isPreferred',
        header: 'Preferred',
        cell: ({ row }) => (row.original.isPreferred ? <Badge variant="success">Yes</Badge> : '—'),
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
                label: 'View',
                permission: binding.permissions.siteItems.view,
                onClick: () => goToItem(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [binding, goToItem],
  );

  const { table } = useDataTable({
    columns,
    serverState: response,
    slug: binding.siteItemsTableSlug(supplierRef),
    label: 'item',
    enableRowSelection: false,
    enableSorting: true,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: binding.siteItemsTableKey(supplierRef) }),
  });

  return (
    <DataTable
      table={table}
      mode="tab"
      isLoading={isLoading}
      permission={binding.permissions.siteItems.view}
      searchConfig={{
        columns: [
          { id: 'inventoryItemName', label: 'Item name' },
          { id: 'supplierItemCode', label: 'Supplier item code' },
        ],
        searchAll: true,
      }}
      emptyStateConfig={{
        icon: ClipboardList,
        title: 'No items',
        description: 'This supplier has no items set up at this site yet.',
      }}
    />
  );
};
