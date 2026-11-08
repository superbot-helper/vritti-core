import { Button } from '@vritti/quantum-ui/Button';
import { DatePicker } from '@vritti/quantum-ui/DatePicker';
import { DateTimePicker } from '@vritti/quantum-ui/DateTimePicker';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { parse } from '@vritti/quantum-ui/date-fns';
import { Form } from '@vritti/quantum-ui/Form';
import { useWorkspaceCurrency, useWorkspaceTimeZone } from '@vritti/quantum-ui/hooks';
import type { SelectOption } from '@vritti/quantum-ui/Select';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { TextField } from '@vritti/quantum-ui/TextField';
import { isoTodayDate } from '@vritti/quantum-ui/timezone';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { buildCreatePurchaseOrderSchema, type CreatePurchaseOrderFormData } from '@/schemas/purchase-orders';
import { CurrencySelector } from '@/selectors/currency';
import { EnrolledSiteSelector } from '@/selectors/enrolled-site';
import type { PurchaseOrdersBinding } from '../bindings';

interface CreatePurchaseOrderDialogProps {
  binding: PurchaseOrdersBinding;
  onSuccess: () => void;
  onCancel: () => void;
}

// Raises a draft order in one of the supplier's currencies; across the legal entity's sites, at a site the supplier is
// enrolled at
export const CreatePurchaseOrderDialog: React.FC<CreatePurchaseOrderDialogProps> = ({
  binding,
  onSuccess,
  onCancel,
}) => {
  const SupplierSelector = binding.suppliers.Selector;
  const leCurrencyCode = useWorkspaceCurrency();
  const timeZone = useWorkspaceTimeZone();
  const schema = useMemo(
    () => buildCreatePurchaseOrderSchema({ leCurrencyCode, requiresSite: binding.spansSites }),
    [leCurrencyCode, binding.spansSites],
  );
  const form = useForm<CreatePurchaseOrderFormData>({
    resolver: zodResolver(schema),
    defaultValues: { orderDate: isoTodayDate(timeZone), notes: '' },
  });
  const createMutation = binding.useCreate({ onSuccess });

  const [supplierCurrencies, setSupplierCurrencies] = useState<string[]>([]);
  const supplierId = useWatch({ control: form.control, name: 'supplierId' });
  const currencyCode = useWatch({ control: form.control, name: 'currencyCode' });
  const orderDate = useWatch({ control: form.control, name: 'orderDate' });
  const minExpectedDate = orderDate ? parse(orderDate, 'yyyy-MM-dd', new Date()) : undefined;
  const needsExchangeRate = !!currencyCode && currencyCode !== leCurrencyCode;

  // A new supplier offers its own currencies, starting from its default, and may not be enrolled at the site picked
  const handleSupplierSelect = (option: SelectOption | null) => {
    const codes = option?.additionals?.currencyCodes;
    const defaultCode = option?.additionals?.currencyCode;
    setSupplierCurrencies(Array.isArray(codes) ? codes.map(String) : []);
    if (typeof defaultCode === 'string') form.setValue('currencyCode', defaultCode, { shouldValidate: true });
    else form.resetField('currencyCode');
    form.resetField('siteId');
  };

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({
        supplierId: data.supplierId,
        siteId: data.siteId,
        currencyCode: data.currencyCode,
        exchangeRate: needsExchangeRate ? data.exchangeRate : undefined,
        orderDate: data.orderDate,
        expectedBy: data.expectedBy,
        notes: data.notes,
      })}
    >
      <SupplierSelector name="supplierId" onOptionSelect={handleSupplierSelect} />
      {binding.spansSites && <EnrolledSiteSelector name="siteId" supplierId={supplierId} />}
      <CurrencySelector
        name="currencyCode"
        includeCodes={supplierCurrencies}
        disabled={supplierCurrencies.length < 2}
        placeholder={supplierCurrencies.length ? 'Select currency' : 'Select a supplier first'}
        description="Lines priced in the supplier's other currencies are converted into it"
      />
      {needsExchangeRate && (
        <TextField
          name="exchangeRate"
          label={`1 ${currencyCode} in ${leCurrencyCode}`}
          type="number"
          placeholder="e.g. 83.25"
          positive
          nonZero
          description="Editable until the first goods receipt of the order is published"
        />
      )}
      <DatePicker name="orderDate" label="Order Date" />
      <DateTimePicker
        name="expectedBy"
        label="Expected By"
        disabled={!orderDate}
        minDate={minExpectedDate}
        calendarProps={minExpectedDate ? { disabled: { before: minExpectedDate } } : undefined}
      />
      <TextArea name="notes" label="Notes" placeholder="Optional notes" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Creating...">
          Create Purchase Order
        </Button>
      </DialogActions>
    </Form>
  );
};
