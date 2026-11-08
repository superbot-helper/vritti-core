import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import {
  type PurchaseOrderDetail,
  type SendPurchaseOrderEmailFormData,
  sendPurchaseOrderEmailSchema,
} from '@/schemas/purchase-orders';
import type { PurchaseOrdersBinding } from '../bindings';

interface SendEmailDialogProps {
  binding: PurchaseOrdersBinding;
  purchaseOrder: PurchaseOrderDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

// Emails the order with its PDF, to the supplier's address unless another is given
export const SendEmailDialog: React.FC<SendEmailDialogProps> = ({ binding, purchaseOrder, onSuccess, onCancel }) => {
  const form = useForm<SendPurchaseOrderEmailFormData>({
    resolver: zodResolver(sendPurchaseOrderEmailSchema),
    defaultValues: { email: '' },
  });
  const sendEmailMutation = binding.useSendEmail({ onSuccess });

  return (
    <Form
      form={form}
      mutation={sendEmailMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: purchaseOrder.id, email: data.email })}
    >
      <TextField
        name="email"
        label="Recipient Email (Optional)"
        type="email"
        placeholder="Uses supplier email if left empty"
      />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Sending...">
          Send Email
        </Button>
      </DialogActions>
    </Form>
  );
};
