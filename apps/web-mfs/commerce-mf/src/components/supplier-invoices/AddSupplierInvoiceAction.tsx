import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { Plus, ReceiptText } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SupplierInvoicesListBinding } from './bindings';
import { CreateSupplierInvoiceDialog } from './forms/CreateSupplierInvoiceDialog';

interface AddSupplierInvoiceActionProps {
  binding: Pick<SupplierInvoicesListBinding, 'permissions' | 'invoicePath' | 'useCreateInvoice'>;
  supplierId?: string;
  purchaseOrderId?: string;
}

// Starts a draft invoice and opens it, so its lines can be entered next
export const AddSupplierInvoiceAction: React.FC<AddSupplierInvoiceActionProps> = ({
  binding,
  supplierId,
  purchaseOrderId,
}) => {
  const navigate = useNavigate();
  const addDialog = useDialog();

  return (
    <>
      <Button
        size="sm"
        permission={binding.permissions.add}
        startAdornment={<Plus className="size-4" />}
        onClick={addDialog.open}
      >
        Add Invoice
      </Button>
      <Dialog
        handle={addDialog}
        icon={ReceiptText}
        title="Add Invoice"
        description="Starts a draft for the supplier's invoice. Enter its billed lines next, then post it."
        content={(close) => (
          <CreateSupplierInvoiceDialog
            binding={binding}
            supplierId={supplierId}
            purchaseOrderId={purchaseOrderId}
            onSuccess={(created) => {
              close();
              navigate(binding.invoicePath(created), { relative: 'path' });
            }}
            onCancel={close}
          />
        )}
      />
    </>
  );
};
