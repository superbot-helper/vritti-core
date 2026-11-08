import { useQueryClient } from '@tanstack/react-query';
import { ORG_TAX_GROUPS } from '@vritti/commerce-permissions/tax-groups';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import {
  type ColumnDef,
  DataTable,
  NumberCell,
  type RowAction,
  RowActions,
  StringCell,
  useDataTable,
} from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { filter } from '@vritti/quantum-ui/filter';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { ISOCountryFilter } from '@vritti/quantum-ui/selects/iso-country';
import { Eye, Pencil, Percent, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TAX_GROUPS_TABLE_KEY, useDeleteTaxGroup, useTaxGroupsTable } from '@/hooks/organization/tax-groups';
import type { TaxGroupData } from '@/schemas/tax-groups';
import { contextValue } from '@/utils/tableContext';
import { TaxTreatmentBadge } from '../components/TaxTreatmentBadge';
import { taxGroupPath } from '../components/taxGroupPath';
import { AddTaxGroupDialog } from '../forms/AddTaxGroupDialog';
import { EditTaxGroupDialog } from '../forms/EditTaxGroupDialog';

interface GroupsTabProps {
  defaultCountry: string | undefined;
  isCountryLoading: boolean;
}

export const GroupsTab = ({ defaultCountry, isCountryLoading }: GroupsTabProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: response, isLoading, isFetching } = useTaxGroupsTable();
  const deleteMutation = useDeleteTaxGroup();
  const addDialog = useDialog();
  const confirm = useConfirm();

  const handleDelete = useCallback(
    async (taxGroup: TaxGroupData) => {
      const ok = await confirm({
        title: `Delete "${taxGroup.name}"?`,
        description: `${taxGroup.name} and its rates will be permanently removed. This action cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'destructive',
      });
      if (ok) deleteMutation.mutate(taxGroup.id);
    },
    [confirm, deleteMutation],
  );

  const columns = useMemo<ColumnDef<TaxGroupData>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => <StringCell value={row.original.code} mono />,
        enableSorting: true,
      },
      { accessorKey: 'name', header: 'Name', enableSorting: true },
      {
        accessorKey: 'treatment',
        header: 'Treatment',
        cell: ({ row }) => <TaxTreatmentBadge treatment={row.original.treatment} />,
        enableSorting: true,
      },
      {
        accessorKey: 'rateCount',
        header: 'Rates',
        cell: ({ row }) => <NumberCell value={row.original.rateCount} />,
        enableSorting: false,
      },
      {
        accessorKey: 'classCount',
        header: 'Classes',
        cell: ({ row }) => <NumberCell value={row.original.classCount} />,
        enableSorting: false,
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) =>
          row.original.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="outline">Inactive</Badge>,
        enableSorting: true,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const r = row.original;
          const actions: RowAction[] = [
            { id: 'view', icon: Eye, label: 'View', onClick: () => navigate(taxGroupPath(r, 'overview')) },
            {
              id: 'edit',
              icon: Pencil,
              label: 'Edit',
              permission: ORG_TAX_GROUPS.edit,
              dialog: {
                title: 'Edit Tax Group',
                description: 'Update the tax group. Its country is fixed.',
                content: (close) => <EditTaxGroupDialog taxGroup={r} onSuccess={close} onCancel={close} />,
              },
            },
            {
              id: 'delete',
              icon: Trash2,
              label: 'Delete',
              variant: 'destructive',
              permission: ORG_TAX_GROUPS.delete,
              disabled: !r.canDelete,
              disabledTip: 'Tax classes are mapped to this group. Remove the mappings first.',
              onClick: () => handleDelete(r),
            },
          ];
          return <RowActions actions={actions} />;
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleDelete, navigate],
  );

  const { table, context } = useDataTable({
    columns,
    slug: 'commerce-org-tax-groups',
    label: 'tax group',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: TAX_GROUPS_TABLE_KEY }),
    defaultContext: defaultCountry ? [filter('country').equals(defaultCountry)] : [],
  });
  const country = contextValue(context, 'country');

  return (
    <>
      <DataTable
        table={table}
        mode="tab"
        isLoading={isCountryLoading || isLoading}
        isFetching={isFetching}
        permission={ORG_TAX_GROUPS.view}
        contextBar={<ISOCountryFilter name="country" mode="context" />}
        searchConfig={{
          columns: [
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
          ],
          searchAll: true,
        }}
        toolbarActions={{
          actions: (
            <Button
              size="sm"
              startAdornment={<Plus className="size-4" />}
              onClick={addDialog.open}
              permission={ORG_TAX_GROUPS.add}
            >
              Add Tax Group
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Percent,
          title: 'No tax groups',
          description: 'Add a tax group for this country, then give it dated rates and map tax classes to it.',
          action: (
            <Button
              startAdornment={<Plus className="size-4" />}
              onClick={addDialog.open}
              permission={ORG_TAX_GROUPS.add}
            >
              Add Tax Group
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={Percent}
        title="Add Tax Group"
        description="A tax group is a rate a country charges, like GST 5% or VAT 0%. You add its rates next."
        content={(close) => (
          <AddTaxGroupDialog
            countryCode={country}
            onSuccess={({ data }) => {
              close();
              navigate(taxGroupPath(data, 'rates'));
            }}
            onCancel={close}
          />
        )}
      />
    </>
  );
};
