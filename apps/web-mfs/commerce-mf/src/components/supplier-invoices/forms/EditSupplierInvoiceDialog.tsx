import { Button } from '@vritti/quantum-ui/Button';
import { DatePicker } from '@vritti/quantum-ui/DatePicker';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { useFormatters, useWorkspaceCurrency } from '@vritti/quantum-ui/hooks';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import {
  buildEditSupplierInvoiceSchema,
  type EditSupplierInvoiceFormData,
  type SupplierInvoice,
} from '@/schemas/supplier-invoices';
import type { SupplierInvoicesBinding } from '../bindings';

interface EditSupplierInvoiceDialogProps {
  binding: SupplierInvoicesBinding;
  invoice: SupplierInvoice;
  onSuccess: () => void;
  onCancel: () => void;
}

// Edits an invoice's number, date, notes and — when it is in a foreign currency — its exchange rate
export const EditSupplierInvoiceDialog: React.FC<EditSupplierInvoiceDialogProps> = ({
  binding,
  invoice,
  onSuccess,
  onCancel,
}) => {
  const fmt = useFormatters();
  const workspaceCurrency = useWorkspaceCurrency();
  const foreignCurrency = invoice.currencyCode !== workspaceCurrency;
  const form = useForm<EditSupplierInvoiceFormData>({
    resolver: zodResolver(buildEditSupplierInvoiceSchema({ foreignCurrency })),
    defaultValues: {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      exchangeRate: invoice.exchangeRate,
      notes: invoice.notes ?? '',
    },
  });
  const updateMutation = binding.useUpdateInvoice({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      onCancel={onCancel}
      transformSubmit={({ exchangeRate, ...data }) => ({
        invoice,
        data: { ...data, notes: data.notes || null, ...(foreignCurrency ? { exchangeRate } : {}) },
      })}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField name="invoiceNumber" label="Invoice Number" placeholder="As printed by the supplier" />
        <DatePicker name="invoiceDate" label="Invoice Date" />
      </div>
      {foreignCurrency && (
        <TextField
          name="exchangeRate"
          label={`Exchange Rate (${invoice.currencyCode} → ${workspaceCurrency})`}
          type="number"
          positive
          nonZero
          description={`The order's rate is ${fmt.number(invoice.poExchangeRate).primary}; a different rate is flagged`}
        />
      )}
      <TextArea name="notes" label="Notes (optional)" placeholder="e.g. Received with the second delivery" />
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
