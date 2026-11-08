import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import type { SelectOption } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { PackageCheck } from 'lucide-react';
import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type AddGoodsReceiptItemFormData, buildAddGoodsReceiptItemSchema } from '@/schemas/goods-receipts';
import { PurchaseOrderItemSelector } from '@/selectors/purchase-order-item';
import type { GoodsReceiptsBinding } from '../bindings';
import { PurchaseOrderLineCounts } from './PurchaseOrderLineCounts';

interface PurchaseOrderLine {
  uomSymbol: string;
  allowDecimal: boolean;
  orderedQty: number;
  expectedFreeQty: number;
  alreadyReceivedQty: number;
}

interface AddItemFormProps {
  binding: GoodsReceiptsBinding;
  goodsReceiptId: string;
  purchaseOrderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Reads the counts of a picked purchase order line from its option
function toPurchaseOrderLine(option: SelectOption): PurchaseOrderLine {
  const additionals = option.additionals ?? {};
  return {
    uomSymbol: String(additionals.uomSymbol ?? ''),
    allowDecimal: additionals.allowDecimal === true,
    orderedQty: Number(additionals.orderedQty ?? 0),
    expectedFreeQty: Number(additionals.expectedFreeQty ?? 0),
    alreadyReceivedQty: Number(additionals.receivedQty ?? 0),
  };
}

// Counts the goods received against one of the purchase order's lines — paid and free together — and what was rejected
const AddItemForm: React.FC<AddItemFormProps> = ({ binding, goodsReceiptId, purchaseOrderId, onSuccess, onCancel }) => {
  const [line, setLine] = useState<PurchaseOrderLine | null>(null);
  const allowDecimal = line?.allowDecimal ?? false;
  // The schema follows the picked line's unit; a ref keeps the resolver on the latest build without a remount
  const schema = useMemo(() => buildAddGoodsReceiptItemSchema({ allowDecimal }), [allowDecimal]);
  const schemaRef = useRef(schema);
  schemaRef.current = schema;
  const form = useForm<AddGoodsReceiptItemFormData>({
    resolver: (values, context, options) => zodResolver(schemaRef.current)(values, context, options),
    defaultValues: { receivedQty: 0, rejectedQuantity: 0 },
  });
  const mutation = binding.useAddItem(goodsReceiptId, { onSuccess });

  // Prefills the received quantity with what the line still expects, ordered and free together
  const handleLineSelect = (option: SelectOption | null) => {
    const picked = option ? toPurchaseOrderLine(option) : null;
    setLine(picked);
    const outstanding = picked ? picked.orderedQty + picked.expectedFreeQty - picked.alreadyReceivedQty : 0;
    form.setValue('receivedQty', Math.max(outstanding, 0));
  };

  return (
    <Form form={form} mutation={mutation} onCancel={onCancel}>
      <PurchaseOrderItemSelector
        name="purchaseOrderItemId"
        label="Purchase Order Line"
        params={{ purchaseOrderId, excludeOnGoodsReceiptId: goodsReceiptId }}
        onOptionSelect={handleLineSelect}
      />
      {line && (
        <PurchaseOrderLineCounts
          uomSymbol={line.uomSymbol}
          orderedQty={line.orderedQty}
          expectedFreeQty={line.expectedFreeQty}
          alreadyReceivedQty={line.alreadyReceivedQty}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          name="receivedQty"
          label="Received"
          description="Paid and free goods together"
          type="number"
          integer={!allowDecimal}
          positive
        />
        <TextField
          name="rejectedQuantity"
          label="Rejected"
          description="Part of the received goods that arrived damaged or unusable"
          type="number"
          integer={!allowDecimal}
        />
      </div>
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Item
        </Button>
      </DialogActions>
    </Form>
  );
};

interface AddItemDialogProps {
  binding: GoodsReceiptsBinding;
  goodsReceiptId: string;
  purchaseOrderId: string;
  handle: DialogHandle;
}

// The Add Item dialog of a draft receipt
export const AddItemDialog: React.FC<AddItemDialogProps> = ({ binding, goodsReceiptId, purchaseOrderId, handle }) => (
  <Dialog
    handle={handle}
    className="max-w-3xl"
    icon={PackageCheck}
    title="Add Item"
    description="Count the goods received against one of the purchase order's lines."
    content={(close) => (
      <AddItemForm
        binding={binding}
        goodsReceiptId={goodsReceiptId}
        purchaseOrderId={purchaseOrderId}
        onSuccess={close}
        onCancel={close}
      />
    )}
  />
);
