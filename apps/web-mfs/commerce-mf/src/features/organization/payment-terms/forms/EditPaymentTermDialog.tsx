import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useUpdatePaymentTerm } from '@/hooks/organization/payment-terms';
import { type EditPaymentTermFormData, editPaymentTermFormSchema, type PaymentTermData } from '@/schemas/payment-terms';

interface EditPaymentTermDialogProps {
  paymentTerm: PaymentTermData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPaymentTermDialog: React.FC<EditPaymentTermDialogProps> = ({ paymentTerm, onSuccess, onCancel }) => {
  const form = useForm<EditPaymentTermFormData>({
    resolver: zodResolver(editPaymentTermFormSchema),
    defaultValues: {
      name: paymentTerm.name,
      description: paymentTerm.description ?? '',
    },
  });

  const updateMutation = useUpdatePaymentTerm({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        id: paymentTerm.id,
        data: {
          name: data.name,
          description: data.description || null,
        },
      })}
    >
      <div className="space-y-4">
        <TextField name="name" label="Name" placeholder="e.g. Net 30" />
        <TextArea name="description" label="Description" placeholder="Optional notes for buyers and accounts" />
      </div>
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
