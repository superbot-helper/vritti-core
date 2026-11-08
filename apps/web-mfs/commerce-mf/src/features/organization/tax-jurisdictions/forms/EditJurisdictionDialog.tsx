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
import { useUpdateTaxJurisdiction } from '@/hooks/organization/tax-jurisdictions';
import {
  levelOptions,
  PARENT_LEVEL_HINTS,
  type TaxJurisdictionData,
  type TaxJurisdictionFormData,
  TaxJurisdictionLevelValues,
  taxJurisdictionSchema,
} from '@/schemas/tax-jurisdictions';
import { JurisdictionSelector } from '@/selectors/jurisdiction';

interface EditJurisdictionDialogProps {
  jurisdiction: TaxJurisdictionData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditJurisdictionDialog: React.FC<EditJurisdictionDialogProps> = ({
  jurisdiction,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<TaxJurisdictionFormData>({
    resolver: zodResolver(taxJurisdictionSchema),
    defaultValues: {
      code: jurisdiction.code,
      name: jurisdiction.name,
      countryCode: jurisdiction.countryCode,
      level: jurisdiction.level,
      parentId: jurisdiction.parentId,
      regionCode: jurisdiction.regionCode ?? '',
      taxUnion: jurisdiction.taxUnion ?? '',
      isActive: jurisdiction.isActive,
    },
  });
  const [selectedCountry, level] = useWatch({ control: form.control, name: ['countryCode', 'level'] });

  const updateMutation = useUpdateTaxJurisdiction({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      onCancel={onCancel}
      transformSubmit={(data: TaxJurisdictionFormData) => ({
        id: jurisdiction.id,
        data: {
          ...data,
          parentId: data.level === TaxJurisdictionLevelValues.STATE ? null : (data.parentId ?? null),
        },
      })}
    >
      <TextField name="code" label="Code" disabled />
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
          params={{ excludeIds: jurisdiction.id }}
        />
      )}
      <TextField name="regionCode" label="Region Code" placeholder="e.g. TS" />
      <TextField name="taxUnion" label="Tax Union" placeholder="e.g. EU" />
      <Switch name="isActive" label="Active" description="Inactive jurisdictions don't appear in selection dropdowns" />
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
