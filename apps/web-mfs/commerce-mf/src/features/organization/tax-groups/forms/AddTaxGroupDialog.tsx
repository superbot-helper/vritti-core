import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { Switch } from '@vritti/quantum-ui/Switch';
import { ISOCountrySelect } from '@vritti/quantum-ui/selects/iso-country';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { TextField } from '@vritti/quantum-ui/TextField';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateTaxGroup } from '@/hooks/organization/tax-groups';
import {
  type CreateTaxGroupFormData,
  createTaxGroupSchema,
  TAX_TREATMENT_OPTIONS,
  type TaxGroupData,
  TaxTreatmentValues,
} from '@/schemas/tax-groups';

interface AddTaxGroupDialogProps {
  countryCode: string | undefined;
  onSuccess: (response: CreateResponse<TaxGroupData>) => void;
  onCancel: () => void;
}

export const AddTaxGroupDialog: React.FC<AddTaxGroupDialogProps> = ({ countryCode, onSuccess, onCancel }) => {
  const form = useForm<CreateTaxGroupFormData>({
    resolver: zodResolver(createTaxGroupSchema),
    defaultValues: {
      countryCode,
      code: '',
      name: '',
      treatment: TaxTreatmentValues.TAXABLE,
      legalText: '',
      isActive: true,
    },
  });

  const createMutation = useCreateTaxGroup({ onSuccess });

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data: CreateTaxGroupFormData) => ({ ...data, legalText: data.legalText || null })}
    >
      <ISOCountrySelect
        name="countryCode"
        description="The country whose tax law this is. It can't be changed later."
      />
      <TextField name="code" label="Code" placeholder="e.g. gst-5" />
      <TextField name="name" label="Name" placeholder="e.g. GST 5%" />
      <Select name="treatment" label="Treatment" options={TAX_TREATMENT_OPTIONS} />
      <TextArea
        name="legalText"
        label="Legal Text (optional)"
        placeholder="e.g. Exempt under Article 47"
        description="Printed on documents taxed by this group"
      />
      <Switch name="isActive" label="Active" description="Inactive groups are hidden from tax group pickers" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Creating...">
          Add Tax Group
        </Button>
      </DialogActions>
    </Form>
  );
};
