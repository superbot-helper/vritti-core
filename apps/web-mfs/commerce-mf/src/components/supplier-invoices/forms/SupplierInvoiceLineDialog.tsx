import { Button } from '@vritti/quantum-ui/Button';
import { CurrencyField } from '@vritti/quantum-ui/CurrencyField';
import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import { DatePicker } from '@vritti/quantum-ui/DatePicker';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import {
  type SupplierInvoice,
  type SupplierInvoiceLine,
  type SupplierInvoiceLineFormData,
  type SupplierInvoiceLinePayload,
  supplierInvoiceLineSchema,
} from '@/schemas/supplier-invoices';
import { PurchaseOrderItemSelector } from '@/selectors/purchase-order-item';
import type { SupplierInvoicesBinding } from '../bindings';
import { invoiceLineMrp } from '../lineMrp';

interface SupplierInvoiceLineDialogProps {
  binding: SupplierInvoicesBinding;
  invoice: SupplierInvoice;
  line?: SupplierInvoiceLine;
  onSuccess: () => void;
  onCancel: () => void;
}

// Adds a billed line for one of the order's lines, or edits one: its batch, quantities and amounts in the invoice currency
export const SupplierInvoiceLineDialog: React.FC<SupplierInvoiceLineDialogProps> = ({
  binding,
  invoice,
  line,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<SupplierInvoiceLineFormData>({
    resolver: zodResolver(supplierInvoiceLineSchema),
    defaultValues: line
      ? {
          purchaseOrderItemId: line.purchaseOrderItemId,
          lotNumber: line.lotNumber ?? '',
          expiryDate: line.expiryDate,
          mrp: invoiceLineMrp(line),
          billedQty: line.billedQty,
          freeQty: line.freeQty,
          unitPrice: line.unitPrice,
          discountAmount: line.discountAmount,
          taxAmount: line.taxAmount,
        }
      : { lotNumber: '', freeQty: 0 },
  });
  const addMutation = binding.useAddLine({ onSuccess });
  const updateMutation = binding.useUpdateLine({ onSuccess });

  // The schema has already rejected an empty unit price by the time the form submits
  const toPayload = (data: SupplierInvoiceLineFormData): SupplierInvoiceLinePayload => ({
    purchaseOrderItemId: data.purchaseOrderItemId,
    lotNumber: data.lotNumber || null,
    expiryDate: data.expiryDate || null,
    mrp: data.mrp?.value ? data.mrp : null,
    billedQty: data.billedQty,
    freeQty: data.freeQty,
    unitPrice: data.unitPrice as CurrencyValue,
    discountAmount: data.discountAmount?.value ? data.discountAmount : undefined,
    taxAmount: data.taxAmount?.value ? data.taxAmount : undefined,
  });

  const body = (
    <>
      <div className="flex flex-col gap-6">
        <FormSection title="Order Line">
          <div className="col-span-2">
            <PurchaseOrderItemSelector
              name="purchaseOrderItemId"
              label="Order Line"
              params={{ purchaseOrderId: invoice.purchaseOrderId }}
              description="Quantities are in the order line's unit"
            />
          </div>
          <TextField name="billedQty" label="Billed Qty" type="number" positive nonZero placeholder="e.g. 20" />
          <TextField name="freeQty" label="Free Qty" type="number" positive placeholder="e.g. 2" />
        </FormSection>

        <FormSection title="Batch">
          <TextField name="lotNumber" label="Batch (optional)" placeholder="As printed on the invoice" />
          <DatePicker name="expiryDate" label="Expiry (optional)" />
          <CurrencyField
            name="mrp"
            label="MRP (optional)"
            currencyCode={invoice.currencyCode}
            description="As printed on the pack"
          />
        </FormSection>

        <FormSection title="Amounts">
          <CurrencyField name="unitPrice" label="Unit Price" currencyCode={invoice.currencyCode} />
          <CurrencyField name="discountAmount" label="Discount (optional)" currencyCode={invoice.currencyCode} />
          <CurrencyField name="taxAmount" label="Tax (optional)" currencyCode={invoice.currencyCode} />
        </FormSection>
      </div>
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          {line ? 'Save Line' : 'Add Line'}
        </Button>
      </DialogActions>
    </>
  );

  return line ? (
    <Form
      form={form}
      mutation={updateMutation}
      onCancel={onCancel}
      transformSubmit={(data) => ({ invoice, lineId: line.id, data: toPayload(data) })}
    >
      {body}
    </Form>
  ) : (
    <Form
      form={form}
      mutation={addMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({ invoice, data: toPayload(data) })}
    >
      {body}
    </Form>
  );
};
