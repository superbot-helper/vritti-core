import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateSupplier } from '@/hooks/legal-entity/suppliers';
import { type EditSupplierFormData, editSupplierFormSchema, type SupplierDetail } from '@/schemas/suppliers';
import { CompanySelector } from '@/selectors/company';
import { PersonSelector } from '@/selectors/person';

interface EditSupplierFormProps {
  supplier: SupplierDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditSupplierForm: React.FC<EditSupplierFormProps> = ({ supplier, onSuccess, onCancel }) => {
  const form = useForm<EditSupplierFormData>({
    resolver: zodResolver(editSupplierFormSchema),
    defaultValues: {
      partyId: supplier.partyId,
      currencyCode: supplier.currencyCode,
      code: supplier.code,
      notes: supplier.notes ?? '',
    },
  });

  const updateMutation = useUpdateSupplier({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      onCancel={onCancel}
      transformSubmit={({ partyId: _partyId, currencyCode: _currencyCode, ...data }) => ({
        id: supplier.id,
        data,
      })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          {supplier.partyType === 'PERSON' ? (
            <PersonSelector name="partyId" label="Supplier" disabled />
          ) : (
            <CompanySelector name="partyId" label="Supplier" disabled />
          )}
        </div>
        <TextField name="code" label="Code" placeholder="e.g. SUP-FRESH-001" />
        <TextField name="currencyCode" label="Currency" disabled />
        <TextArea name="notes" label="Notes" placeholder="Optional notes" rows={3} className="w-full sm:col-span-2" />
      </div>
      <DialogActions>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
