import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useBulkSetSupplierDefaultPaymentTerm } from '@/hooks/legal-entity/suppliers';
import { type SetSupplierDefaultPaymentTermFormData, setSupplierDefaultPaymentTermSchema } from '@/schemas/suppliers';
import { PaymentTermSelector } from '@/selectors/payment-term';

interface BulkChangeDefaultPaymentTermDialogProps {
  supplierIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const BulkChangeDefaultPaymentTermDialog: React.FC<BulkChangeDefaultPaymentTermDialogProps> = ({
  supplierIds,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<SetSupplierDefaultPaymentTermFormData>({
    resolver: zodResolver(setSupplierDefaultPaymentTermSchema),
  });

  const mutation = useBulkSetSupplierDefaultPaymentTerm({ onSuccess });

  return (
    <Form
      form={form}
      mutation={mutation}
      onCancel={onCancel}
      transformSubmit={(data) => ({ ids: supplierIds, defaultPaymentTermId: data.defaultPaymentTermId })}
    >
      <PaymentTermSelector
        name="defaultPaymentTermId"
        label="Default Payment Term"
        description="Prefilled when a site enrolls these suppliers; existing enrollments keep their own"
      />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Apply
        </Button>
      </DialogActions>
    </Form>
  );
};
