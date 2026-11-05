import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import { useWorkspaceCurrency } from '@vritti/quantum-ui/hooks';
import { RadioGroup } from '@vritti/quantum-ui/RadioGroup';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useCreateSupplier } from '@/hooks/legal-entity/suppliers';
import {
  type CreateSupplierFormData,
  createSupplierSchema,
  SUPPLIER_PARTY_TYPE_OPTIONS,
  type SupplierPartyType,
} from '@/schemas/suppliers';
import { CompanySelector } from '@/selectors/company';
import { CurrencySelector } from '@/selectors/currency';
import { PaymentTermSelector } from '@/selectors/payment-term';
import { PersonSelector } from '@/selectors/person';

interface AddSupplierDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddSupplierDialog: React.FC<AddSupplierDialogProps> = ({ onSuccess, onCancel }) => {
  const workspaceCurrency = useWorkspaceCurrency();
  const form = useForm<CreateSupplierFormData>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      code: '',
      currencyCodes: [workspaceCurrency],
      currencyCode: workspaceCurrency,
      notes: '',
      purchasingBlocked: false,
      paymentBlocked: false,
      isActive: true,
    },
  });

  // Which party picker shows; UI state only, the API takes just the party
  const [partyType, setPartyType] = useState<SupplierPartyType>('COMPANY');
  const createMutation = useCreateSupplier({ onSuccess });
  const currencyCodes = useWatch({ control: form.control, name: 'currencyCodes' });
  const defaultCurrency = useWatch({ control: form.control, name: 'currencyCode' });

  // The default follows the list: dropping it falls back to the first currency left
  useEffect(() => {
    if (!currencyCodes?.length || currencyCodes.includes(defaultCurrency)) return;
    form.setValue('currencyCode', currencyCodes[0], { shouldValidate: true });
  }, [currencyCodes, defaultCurrency, form]);

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({
        partyId: data.partyId,
        code: data.code,
        currencyCode: data.currencyCode,
        currencyCodes: data.currencyCodes,
        defaultPaymentTermId: data.defaultPaymentTermId,
        notes: data.notes,
        purchasingBlocked: data.purchasingBlocked,
        paymentBlocked: data.paymentBlocked,
        isActive: data.isActive,
      })}
    >
      <div className="space-y-6">
        <FormSection title="Supplier" contentClassName="block">
          <div className="flex flex-col gap-4">
            <RadioGroup
              label="Supplier Type"
              orientation="horizontal"
              options={SUPPLIER_PARTY_TYPE_OPTIONS}
              value={partyType}
              onValueChange={(value) => {
                setPartyType(value === 'PERSON' ? 'PERSON' : 'COMPANY');
                form.resetField('partyId');
              }}
            />
            {partyType === 'COMPANY' ? (
              <CompanySelector name="partyId" label="Supplier" />
            ) : (
              <PersonSelector name="partyId" label="Supplier" />
            )}
          </div>
        </FormSection>

        <FormSection title="Commercial Terms" contentClassName="block">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencySelector
              name="currencyCodes"
              label="Currencies"
              placeholder="Select currencies"
              multiple
              description="Every currency this supplier quotes and invoices in"
            />
            <TextField name="code" label="Code" placeholder="e.g. SUP-FRESH-001" />
            <CurrencySelector
              name="currencyCode"
              label="Default Currency"
              includeCodes={currencyCodes ?? []}
              disabled={!currencyCodes?.length}
              description="New items, quotations and purchase orders start in it"
            />
            <PaymentTermSelector
              name="defaultPaymentTermId"
              label="Default Payment Term"
              description="Prefilled when a site enrolls this supplier"
            />
            <div className="sm:col-span-2">
              <TextArea name="notes" label="Notes" placeholder="Optional notes" />
            </div>
            <div className="sm:col-span-2">
              <Switch name="isActive" label="Active" description="Inactive suppliers are hidden from procurement" />
            </div>
          </div>
        </FormSection>

        <FormSection title="Blocks" contentClassName="block">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Switch
              name="purchasingBlocked"
              label="Purchasing Blocked"
              description="Prevents new purchase orders to this supplier"
            />
            <Switch name="paymentBlocked" label="Payment Blocked" description="Prevents payments to this supplier" />
          </div>
        </FormSection>
      </div>
      <DialogActions>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Creating...">
          Add Supplier
        </Button>
      </DialogActions>
    </Form>
  );
};
