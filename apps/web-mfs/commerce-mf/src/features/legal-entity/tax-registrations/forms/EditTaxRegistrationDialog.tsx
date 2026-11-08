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
import { useUpdateTaxRegistration } from '@/hooks/legal-entity/tax-registrations';
import {
  REGISTRATION_TYPE_OPTIONS,
  type TaxRegistrationData,
  type TaxRegistrationFormData,
  taxRegistrationSchema,
} from '@/schemas/tax-registrations';
import { JurisdictionSelector } from '@/selectors/jurisdiction';

interface EditTaxRegistrationDialogProps {
  registration: TaxRegistrationData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditTaxRegistrationDialog: React.FC<EditTaxRegistrationDialogProps> = ({
  registration,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<TaxRegistrationFormData>({
    resolver: zodResolver(taxRegistrationSchema),
    defaultValues: {
      countryCode: registration.countryCode,
      jurisdictionId: registration.jurisdictionId,
      registrationNumber: registration.registrationNumber,
      registrationType: registration.registrationType,
      isPrimary: registration.isPrimary,
    },
  });
  const countryCode = useWatch({ control: form.control, name: 'countryCode' });

  const updateMutation = useUpdateTaxRegistration({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      onCancel={onCancel}
      transformSubmit={(data: TaxRegistrationFormData) => ({
        id: registration.id,
        data: { ...data, jurisdictionId: data.jurisdictionId ?? null },
      })}
    >
      <div className="flex flex-col gap-4">
        <ISOCountrySelect
          name="countryCode"
          description="The country that issued the number."
          onOptionSelect={(option) => {
            // The state belongs to the old country; null replaces the default so it cannot come back
            if (option?.value !== countryCode) form.resetField('jurisdictionId', { defaultValue: null });
          }}
        />
        <JurisdictionSelector
          name="jurisdictionId"
          label="State"
          country={countryCode}
          clearable
          description="Required for a GSTIN. Leave empty for a national registration, like a VAT number."
        />
        <TextField
          name="registrationNumber"
          label="Registration Number"
          placeholder="e.g. 36BPNPL2271K2ZH"
          description="As issued — the first two digits of a GSTIN are its state code."
        />
        <Select name="registrationType" label="Type" options={REGISTRATION_TYPE_OPTIONS} />
        <Switch
          name="isPrimary"
          label="Primary registration"
          description="The one this company files under by default. Setting it clears the flag on the others."
        />
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
