import { useQueryClient } from '@tanstack/react-query';
import { ORG_TAX_GROUPS } from '@vritti/commerce-permissions/tax-groups';
import { Badge } from '@vritti/quantum-ui/Badge';
import {
  type ColumnDef,
  DataTable,
  DateCell,
  type RowAction,
  RowActions,
  StringCell,
  useDataTable,
} from '@vritti/quantum-ui/DataTable';
import { filter } from '@vritti/quantum-ui/filter';
import { ISOCountryFilter } from '@vritti/quantum-ui/selects/iso-country';
import { ArrowRightLeft, Eye, Link2, Tags } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TAX_CLASS_MAPPING_TABLE_KEY, useTaxClassMappingTable } from '@/hooks/organization/tax-groups';
import type { TaxClassMappingData } from '@/schemas/tax-groups';
import { taxGroupPath } from '../components/taxGroupPath';
import { TaxClassGroupDialog } from '../forms/TaxClassGroupDialog';

interface ClassMappingTabProps {
  defaultCountry: string | undefined;
  isCountryLoading: boolean;
}

// Every tax class with the tax group it maps to in the chosen country today, so unmapped classes stand out
export const ClassMappingTab = ({ defaultCountry, isCountryLoading }: ClassMappingTabProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: response, isLoading, isFetching } = useTaxClassMappingTable();

  const columns = useMemo<ColumnDef<TaxClassMappingData>[]>(
    () => [
      { accessorKey: 'taxClassName', header: 'Class', enableSorting: true },
      {
        accessorKey: 'taxClassCode',
        header: 'Code',
        cell: ({ row }) => <StringCell value={row.original.taxClassCode} mono />,
        enableSorting: true,
      },
      {
        id: 'taxGroup',
        header: 'Tax Group',
        cell: ({ row }) =>
          row.original.mapping ? row.original.mapping.taxGroupName : <Badge variant="warning">No group</Badge>,
        enableSorting: false,
      },
      {
        id: 'validFrom',
        header: 'Valid From',
        cell: ({ row }) => <DateCell value={row.original.mapping?.validFrom} />,
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const r = row.original;
          const { mapping } = r;
          const actions: RowAction[] = [
            {
              id: 'map',
              icon: mapping ? ArrowRightLeft : Link2,
              label: mapping ? 'Change group' : 'Map to group',
              permission: ORG_TAX_GROUPS.classes.add,
              dialog: {
                title: mapping ? `Change the group of ${r.taxClassName}` : `Map ${r.taxClassName}`,
                description: mapping
                  ? `${r.taxClassName} moves to the new group from the date you choose; ${mapping.taxGroupName} ends the day before.`
                  : `Choose the ${r.countryCode} tax group ${r.taxClassName} is taxed by, and from when.`,
                content: (close) => (
                  <TaxClassGroupDialog
                    countryCode={r.countryCode}
                    taxClassId={r.taxClassId}
                    onSuccess={close}
                    onCancel={close}
                  />
                ),
              },
            },
            {
              id: 'view-group',
              icon: Eye,
              label: 'View group',
              hidden: !mapping,
              onClick: () =>
                mapping && navigate(taxGroupPath({ id: mapping.taxGroupId, name: mapping.taxGroupName }, 'classes')),
            },
          ];
          return <RowActions actions={actions} />;
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [navigate],
  );

  const { table } = useDataTable({
    columns,
    slug: 'commerce-org-tax-class-mapping',
    label: 'tax class',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: TAX_CLASS_MAPPING_TABLE_KEY }),
    defaultContext: defaultCountry ? [filter('country').equals(defaultCountry)] : [],
  });

  return (
    <DataTable
      table={table}
      mode="tab"
      isLoading={isCountryLoading || isLoading}
      isFetching={isFetching}
      permission={ORG_TAX_GROUPS.classes.view}
      contextBar={<ISOCountryFilter name="country" mode="context" />}
      searchConfig={{
        columns: [
          { id: 'taxClassName', label: 'Class' },
          { id: 'taxClassCode', label: 'Code' },
        ],
        searchAll: true,
      }}
      emptyStateConfig={{
        icon: Tags,
        title: 'No tax classes',
        description: 'Add tax classes such as Medicines or Cosmetics, then map each to a tax group of this country.',
      }}
    />
  );
};
