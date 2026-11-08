import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import {
  type PurchaseOrderDetail,
  type UpdatePurchaseOrderNotesFormData,
  updatePurchaseOrderNotesSchema,
} from '@/schemas/purchase-orders';
import type { PurchaseOrdersBinding } from '../bindings';

interface UpdateNotesDialogProps {
  binding: PurchaseOrdersBinding;
  purchaseOrder: PurchaseOrderDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

// Edits the order's notes; clearing them removes them
export const UpdateNotesDialog: React.FC<UpdateNotesDialogProps> = ({
  binding,
  purchaseOrder,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<UpdatePurchaseOrderNotesFormData>({
    resolver: zodResolver(updatePurchaseOrderNotesSchema),
    defaultValues: { notes: purchaseOrder.notes ?? '' },
  });
  const updateNotesMutation = binding.useUpdateNotes({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateNotesMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: purchaseOrder.id, notes: data.notes })}
    >
      <TextArea name="notes" label="Notes" placeholder="Add notes" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Updating...">
          Update Notes
        </Button>
      </DialogActions>
    </Form>
  );
};
