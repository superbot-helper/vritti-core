import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { Switch } from '@vritti/quantum-ui/Switch';
import { ISOCountrySelect } from '@vritti/quantum-ui/selects/iso-country';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useCreateTaxJurisdiction } from '@/hooks/organization/tax-jurisdictions';
import {
  CHILD_LEVEL,
  levelOptions,
  PARENT_LEVEL_HINTS,
  type TaxJurisdictionData,
  type TaxJurisdictionFormData,
  TaxJurisdictionLevelValues,
  taxJurisdictionSchema,
} from '@/schemas/tax-jurisdictions';
import { JurisdictionSelector } from '@/selectors/jurisdiction';

interface AddJurisdictionDialogProps {
  parent?: TaxJurisdictionData;
  countryCode?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddJurisdictionDialog: React.FC<AddJurisdictionDialogProps> = ({
  parent,
  countryCode,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<TaxJurisdictionFormData>({
    resolver: zodResolver(taxJurisdictionSchema),
    defaultValues: {
      code: '',
      name: '',
      countryCode: parent?.countryCode ?? countryCode,
      level: parent ? CHILD_LEVEL[parent.level] : TaxJurisdictionLevelValues.STATE,
      parentId: parent?.id,
      regionCode: '',
      taxUnion: '',
      isActive: true,
    },
  });
  const [selectedCountry, level] = useWatch({ control: form.control, name: ['countryCode', 'level'] });

  const createMutation = useCreateTaxJurisdiction({ onSuccess });

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data: TaxJurisdictionFormData) => ({
        ...data,
        parentId: data.level === TaxJurisdictionLevelValues.STATE ? null : (data.parentId ?? null),
      })}
    >
      <TextField name="code" label="Code" placeholder="e.g. in-ts" />
      <TextField name="name" label="Name" placeholder="e.g. Telangana" />
      <ISOCountrySelect
        name="countryCode"
        onOptionSelect={(option) => {
          // The parent belongs to the old country; null replaces the default so it cannot come back
          if (option?.value !== selectedCountry) form.resetField('parentId', { defaultValue: null });
        }}
      />
      <Select name="level" label="Level" options={levelOptions} />
      {level !== TaxJurisdictionLevelValues.STATE && (
        <JurisdictionSelector
          name="parentId"
          label="Parent"
          country={selectedCountry}
          description={PARENT_LEVEL_HINTS[level]}
        />
      )}
      <TextField name="regionCode" label="Region Code" placeholder="e.g. TS" />
      <TextField name="taxUnion" label="Tax Union" placeholder="e.g. EU" />
      <Switch name="isActive" label="Active" description="Inactive jurisdictions don't appear in selection dropdowns" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Creating...">
          Add Jurisdiction
        </Button>
      </DialogActions>
    </Form>
  );
};
