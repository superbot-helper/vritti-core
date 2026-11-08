import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import type React from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SupplierInvoice } from '@/schemas/supplier-invoices';
import type { SupplierInvoiceRemovalBinding } from './bindings';

interface SupplierInvoiceDeleteZoneProps {
  removal: SupplierInvoiceRemovalBinding;
  invoice: SupplierInvoice;
  listPath: string;
}

// Deletes a draft invoice with its lines, then returns to the invoices list
export const SupplierInvoiceDeleteZone: React.FC<SupplierInvoiceDeleteZoneProps> = ({ removal, invoice, listPath }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const deleteMutation = removal.useDeleteInvoice({ onSuccess: () => navigate(listPath, { relative: 'path' }) });

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: `Delete invoice "${invoice.invoiceNumber}"?`,
      description: 'The draft and its lines are permanently deleted. This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(invoice);
  }, [confirm, deleteMutation, invoice]);

  return (
    <DangerZone
      title="Delete this invoice"
      description="Deletes the draft and its lines. A posted invoice is cancelled instead."
      buttonText="Delete Invoice"
      permission={removal.permissions.delete}
      onClick={handleDelete}
      isLoading={deleteMutation.isPending}
      disabled={deleteMutation.isPending}
    />
  );
};
