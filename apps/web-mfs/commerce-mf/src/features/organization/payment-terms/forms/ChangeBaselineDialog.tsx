import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useChangePaymentTermBaseline } from '@/hooks/organization/payment-terms';
import {
  type ChangePaymentTermBaselineFormData,
  changePaymentTermBaselineSchema,
  PAYMENT_TERM_BASELINE_OPTIONS,
  type PaymentTermData,
} from '@/schemas/payment-terms';

interface ChangeBaselineDialogProps {
  paymentTerm: PaymentTermData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChangeBaselineDialog: React.FC<ChangeBaselineDialogProps> = ({ paymentTerm, onSuccess, onCancel }) => {
  const form = useForm<ChangePaymentTermBaselineFormData>({
    resolver: zodResolver(changePaymentTermBaselineSchema),
    defaultValues: { baseline: paymentTerm.baseline },
  });
  const changeMutation = useChangePaymentTermBaseline({ onSuccess });

  return (
    <Form
      form={form}
      mutation={changeMutation}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: paymentTerm.id, baseline: data.baseline })}
    >
      <Select
        name="baseline"
        label="Baseline"
        placeholder="Select baseline"
        description="Every rule's due date and discount deadline counts from this date"
        options={PAYMENT_TERM_BASELINE_OPTIONS}
      />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Change Baseline
        </Button>
      </DialogActions>
    </Form>
  );
};
