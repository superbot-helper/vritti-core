import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@vritti/quantum-ui/Button';
import {
  type ColumnDef,
  DataTable,
  DateCell,
  RowActions,
  StringCell,
  useDataTable,
} from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Eye, PackageCheck, Plus } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreateGoodsReceiptDialog } from '@/components/goods-receipts/forms/CreateGoodsReceiptDialog';
import { GoodsReceiptStatusBadge } from '@/components/goods-receipts/GoodsReceiptStatusBadge';
import type { GoodsReceiptData } from '@/schemas/goods-receipts';
import { type PurchaseOrderDetail, RECEIVABLE_PURCHASE_ORDER_STATUSES } from '@/schemas/purchase-orders';
import { workspaceBase } from '@/utils/workspace';
import type { PurchaseOrdersBinding } from '../bindings';

interface GoodsReceiptsTabProps {
  binding: PurchaseOrdersBinding;
  purchaseOrder: PurchaseOrderDetail;
}

// The goods receipts counted against the order, where a new one is started; a row opens the receipt in the goods receipts feature
export const GoodsReceiptsTab: React.FC<GoodsReceiptsTabProps> = ({ binding, purchaseOrder }) => {
  const purchaseOrderId = purchaseOrder.id;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const createReceiptDialog = useDialog();
  const { data: response, isLoading } = binding.useGoodsReceiptsTable(purchaseOrderId);

  const openReceipt = useCallback(
    (receipt: GoodsReceiptData) =>
      navigate(`${workspaceBase(pathname)}/goods-receipts/${buildSlug(receipt.grNumber, receipt.id)}`),
    [navigate, pathname],
  );

  const columns = useMemo<ColumnDef<GoodsReceiptData>[]>(
    () => [
      {
        accessorKey: 'grNumber',
        header: 'GR Number',
        cell: ({ row }) => <StringCell value={row.original.grNumber} mono />,
      },
      {
        accessorKey: 'receivedDate',
        header: 'Received Date',
        cell: ({ row }) => <DateCell value={row.original.receivedDate} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <GoodsReceiptStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => <StringCell value={row.original.notes} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <RowActions actions={[{ id: 'view', icon: Eye, label: 'View', onClick: () => openReceipt(row.original) }]} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [openReceipt],
  );

  const { table } = useDataTable({
    columns,
    slug: binding.goodsReceiptsTableSlug(purchaseOrderId),
    label: 'goods receipt',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: binding.goodsReceiptsTableKey(purchaseOrderId) }),
  });

  const createReceiptAction = RECEIVABLE_PURCHASE_ORDER_STATUSES.includes(purchaseOrder.status) && (
    <Button
      size="sm"
      permission={binding.goodsReceipts.addPermission}
      startAdornment={<Plus className="size-4" />}
      onClick={createReceiptDialog.open}
    >
      Create Goods Receipt
    </Button>
  );

  return (
    <>
      <DataTable
        table={table}
        mode="tab"
        isLoading={isLoading}
        permission={binding.permissions.view}
        onRowClick={openReceipt}
        toolbarActions={{ actions: createReceiptAction }}
        emptyStateConfig={{
          icon: PackageCheck,
          title: 'No goods receipts',
          description: 'Goods received against this purchase order will appear here.',
          action: createReceiptAction,
        }}
      />

      <Dialog
        handle={createReceiptDialog}
        icon={PackageCheck}
        title="Create Goods Receipt"
        description={`Start a draft receipt of the goods delivered against ${purchaseOrder.poNumber}, then count them line by line.`}
        content={(close) => (
          <CreateGoodsReceiptDialog
            useCreateGoodsReceipt={binding.goodsReceipts.useCreate}
            purchaseOrderId={purchaseOrderId}
            onSuccess={(receipt) => {
              close();
              openReceipt(receipt);
            }}
            onCancel={close}
          />
        )}
      />
    </>
  );
};
