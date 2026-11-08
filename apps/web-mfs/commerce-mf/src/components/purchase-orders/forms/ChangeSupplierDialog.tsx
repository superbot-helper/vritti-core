import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { useWorkspaceCurrency } from '@vritti/quantum-ui/hooks';
import type { SelectOption } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  type ChangePurchaseOrderSupplierFormData,
  changePurchaseOrderSupplierSchema,
  type PurchaseOrderDetail,
} from '@/schemas/purchase-orders';
import type { PurchaseOrdersBinding } from '../bindings';

interface ChangeSupplierDialogProps {
  binding: PurchaseOrdersBinding;
  purchaseOrder: PurchaseOrderDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

// Moves a draft order without lines to another supplier; a supplier without the order's currency moves it into its own
export const ChangeSupplierDialog: React.FC<ChangeSupplierDialogProps> = ({
  binding,
  purchaseOrder,
  onSuccess,
  onCancel,
}) => {
  const SupplierSelector = binding.suppliers.Selector;
  const leCurrencyCode = useWorkspaceCurrency();
  const form = useForm<ChangePurchaseOrderSupplierFormData>({
    resolver: zodResolver(changePurchaseOrderSupplierSchema),
    defaultValues: { supplierId: purchaseOrder.supplierId },
  });
  const rateCurrency = useWatch({ control: form.control, name: 'rateCurrency' });
  const changeSupplierMutation = binding.useChangeSupplier({ onSuccess });

  // The order keeps its currency when the new supplier trades in it, else takes the supplier's default
  const handleSupplierSelect = (option: SelectOption | null) => {
    const codes = option?.additionals?.currencyCodes;
    const defaultCode = option?.additionals?.currencyCode;
    const keepsCurrency = Array.isArray(codes) && codes.includes(purchaseOrder.currencyCode);
    const nextCurrency = keepsCurrency || typeof defaultCode !== 'string' ? purchaseOrder.currencyCode : defaultCode;
    const needsRate = nextCurrency !== purchaseOrder.currencyCode && nextCurrency !== leCurrencyCode;
    form.setValue('rateCurrency', needsRate ? nextCurrency : undefined);
    form.resetField('exchangeRate');
  };

  return (
    <Form
      form={form}
      mutation={changeSupplierMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({
        id: purchaseOrder.id,
        supplierId: data.supplierId,
        exchangeRate: data.rateCurrency ? data.exchangeRate : undefined,
      })}
    >
      <SupplierSelector name="supplierId" onOptionSelect={handleSupplierSelect} />
      {rateCurrency && (
        <TextField
          name="exchangeRate"
          label={`1 ${rateCurrency} in ${leCurrencyCode}`}
          type="number"
          placeholder="e.g. 83.25"
          positive
          nonZero
          description={`The new supplier trades in ${rateCurrency}, so the order moves into it`}
        />
      )}
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Updating...">
          Change Supplier
        </Button>
      </DialogActions>
    </Form>
  );
};
