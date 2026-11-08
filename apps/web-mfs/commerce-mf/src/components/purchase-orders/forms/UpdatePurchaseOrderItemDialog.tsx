import { Button } from '@vritti/quantum-ui/Button';
import { CurrencyField } from '@vritti/quantum-ui/CurrencyField';
import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FreeQtyPreview } from '@/components/FreeQtyPreview';
import {
  buildUpdatePurchaseOrderItemSchema,
  type PurchaseOrderDetail,
  type PurchaseOrderItemData,
  type UpdatePurchaseOrderItemFormData,
} from '@/schemas/purchase-orders';
import { computeFreeQty } from '@/utils/freeQty';
import type { PurchaseOrdersBinding } from '../bindings';
import { ConversionPreview } from '../ConversionPreview';

interface UpdatePurchaseOrderItemDialogProps {
  binding: PurchaseOrdersBinding;
  purchaseOrder: PurchaseOrderDetail;
  item: PurchaseOrderItemData;
  onSuccess: () => void;
  onCancel: () => void;
}

// Changes a line's quantity, price or scheme; a line quoted in another of the supplier's currencies is edited as quoted
export const UpdatePurchaseOrderItemDialog: React.FC<UpdatePurchaseOrderItemDialogProps> = ({
  binding,
  purchaseOrder,
  item,
  onSuccess,
  onCancel,
}) => {
  const schema = useMemo(() => buildUpdatePurchaseOrderItemSchema({ minQty: item.receivedQty }), [item.receivedQty]);
  const form = useForm<UpdatePurchaseOrderItemFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      uomQty: item.uomQty,
      unitPrice: item.sourceUnitPrice ?? item.unitPrice,
      schemeBuyQty: item.schemeBuyQty ?? undefined,
      schemeFreeQty: item.schemeFreeQty ?? undefined,
      hasScheme: item.hasScheme,
    },
  });
  const mutation = binding.useUpdateItem({ onSuccess });
  const hasScheme = form.watch('hasScheme');
  const unitPrice = form.watch('unitPrice');
  const sourceCurrency = item.sourceUnitPrice?.currency;
  const sourceRate = sourceCurrency ? purchaseOrder.conversionRates[sourceCurrency] : undefined;
  const freeQtyPreview = computeFreeQty(
    form.watch('uomQty'),
    form.watch('schemeBuyQty'),
    form.watch('schemeFreeQty'),
    hasScheme,
  );

  return (
    <Form
      form={form}
      mutation={mutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        id: purchaseOrder.id,
        itemId: item.id,
        uomQty: data.uomQty,
        unitPrice: data.unitPrice as CurrencyValue | undefined,
        schemeBuyQty: data.schemeBuyQty,
        schemeFreeQty: data.schemeFreeQty,
        hasScheme: data.hasScheme,
      })}
    >
      <FormSection title="Item" contentClassName="block">
        <div className="flex flex-col gap-4">
          <DetailField label="UOM" type="string" value={item.orderUomSymbol} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField name="uomQty" label="Quantity" type="number" placeholder="e.g. 500" />
            <CurrencyField
              name="unitPrice"
              label={sourceCurrency ? `Unit Price (${sourceCurrency})` : 'Unit Price'}
              currencyCode={sourceCurrency ?? purchaseOrder.currencyCode}
              placeholder="Enter unit price"
            />
            {sourceCurrency && (
              <ConversionPreview
                price={unitPrice}
                poCurrencyCode={purchaseOrder.currencyCode}
                rate={sourceRate ? Number(sourceRate) : undefined}
              />
            )}
            {hasScheme && <FreeQtyPreview value={freeQtyPreview} />}
          </div>
        </div>
      </FormSection>
      <FormSection title="Free Goods Scheme" contentClassName="block">
        <div className="flex flex-col gap-4">
          <Switch name="hasScheme" label="Free goods scheme" description="Supplier ships bonus units on this item." />
          {hasScheme && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField name="schemeBuyQty" label="Buy Qty" type="number" integer positive />
              <TextField name="schemeFreeQty" label="Free Qty" type="number" integer positive />
            </div>
          )}
        </div>
      </FormSection>
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Updating...">
          Update Line Item
        </Button>
      </DialogActions>
    </Form>
  );
};
