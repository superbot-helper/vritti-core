import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useCreatePaymentTerm } from '@/hooks/organization/payment-terms';
import {
  type CreatePaymentTermFormData,
  createPaymentTermSchema,
  PAYMENT_TERM_BASELINE_OPTIONS,
  PaymentTermBaselineValues,
  type PaymentTermData,
} from '@/schemas/payment-terms';

interface AddPaymentTermDialogProps {
  onSuccess: (term: PaymentTermData) => void;
  onCancel: () => void;
}

export const AddPaymentTermDialog: React.FC<AddPaymentTermDialogProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreatePaymentTermFormData>({
    resolver: zodResolver(createPaymentTermSchema),
    defaultValues: { name: '', baseline: PaymentTermBaselineValues.INVOICE_DATE, description: '' },
  });

  const createMutation = useCreatePaymentTerm({ onSuccess });

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({ ...data, description: data.description || null })}
    >
      <div className="space-y-4">
        <TextField name="name" label="Name" placeholder="e.g. Net 30" />
        <Select
          name="baseline"
          label="Baseline"
          placeholder="Select baseline"
          description="The date the due days count from"
          options={PAYMENT_TERM_BASELINE_OPTIONS}
        />
        <TextArea name="description" label="Description" placeholder="Optional notes for buyers and accounts" />
      </div>
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Creating...">
          Create Draft
        </Button>
      </DialogActions>
    </Form>
  );
};
