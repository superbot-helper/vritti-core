import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import { Ban, Pencil, ReceiptText, Send } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import type { SupplierInvoice } from '@/schemas/supplier-invoices';
import type { SupplierInvoiceRemovalBinding, SupplierInvoicesBinding } from './bindings';
import { EditSupplierInvoiceDialog } from './forms/EditSupplierInvoiceDialog';

interface SupplierInvoiceHeaderActionsProps {
  binding: SupplierInvoicesBinding;
  invoice: SupplierInvoice;
}

// Edits the header, cancels the invoice where the workspace may, and posts a draft — the primary action, rightmost
export const SupplierInvoiceHeaderActions: React.FC<SupplierInvoiceHeaderActionsProps> = ({ binding, invoice }) => {
  const editDialog = useDialog();
  const confirm = useConfirm();
  const postMutation = binding.usePostInvoice();

  const handlePost = useCallback(async () => {
    const confirmed = await confirm({
      title: `Post invoice "${invoice.invoiceNumber}"?`,
      description:
        'Its lines set the final cost of the stock they bill: stock on hand is revalued, and the difference on stock ' +
        'already used is recorded as a variance.',
      confirmLabel: 'Post Invoice',
      ...(invoice.flagCount > 0 && {
        alert: {
          type: 'warning' as const,
          text: `${pluralize('match flag', invoice.flagCount, true)} still open — flags are for review and do not stop posting.`,
        },
      }),
    });
    if (confirmed) postMutation.mutate(invoice);
  }, [confirm, postMutation, invoice]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        permission={binding.permissions.edit}
        startAdornment={<Pencil className="size-4" />}
        onClick={editDialog.open}
        disabled={!invoice.canEdit}
        disabledTip="A cancelled invoice cannot be changed"
      >
        Edit
      </Button>
      {binding.removal && invoice.canCancel && <CancelInvoiceAction removal={binding.removal} invoice={invoice} />}
      {invoice.status === 'DRAFT' && (
        <Button
          size="sm"
          permission={binding.permissions.edit}
          startAdornment={<Send className="size-4" />}
          onClick={handlePost}
          isLoading={postMutation.isPending}
          disabled={!invoice.canPost}
          disabledTip="Add the billed lines before posting"
        >
          Post Invoice
        </Button>
      )}
      <Dialog
        handle={editDialog}
        icon={ReceiptText}
        title="Edit Invoice"
        description={
          invoice.status === 'POSTED'
            ? 'Update the invoice header. The stock it billed is re-costed at the new rate.'
            : 'Update the invoice header.'
        }
        content={(close) => (
          <EditSupplierInvoiceDialog binding={binding} invoice={invoice} onSuccess={close} onCancel={close} />
        )}
      />
    </div>
  );
};

interface CancelInvoiceActionProps {
  removal: SupplierInvoiceRemovalBinding;
  invoice: SupplierInvoice;
}

// Cancels the invoice; a posted one has its costing reversed
const CancelInvoiceAction: React.FC<CancelInvoiceActionProps> = ({ removal, invoice }) => {
  const confirm = useConfirm();
  const cancelMutation = removal.useCancelInvoice();

  const handleCancel = useCallback(async () => {
    const confirmed = await confirm({
      title: `Cancel invoice "${invoice.invoiceNumber}"?`,
      description:
        invoice.status === 'POSTED'
          ? 'Its costing is reversed: the stock it billed goes back to its provisional cost from the order. The invoice is kept as cancelled.'
          : 'The draft is kept as cancelled and no longer counts against the order.',
      confirmLabel: 'Cancel Invoice',
      cancelLabel: 'Keep Invoice',
      variant: 'destructive',
    });
    if (confirmed) cancelMutation.mutate(invoice);
  }, [confirm, cancelMutation, invoice]);

  return (
    <Button
      variant="destructive"
      size="sm"
      permission={removal.permissions.cancel}
      startAdornment={<Ban className="size-4" />}
      onClick={handleCancel}
      isLoading={cancelMutation.isPending}
    >
      Cancel Invoice
    </Button>
  );
};
