import { Button } from '@vritti/quantum-ui/Button';
import { DatePicker } from '@vritti/quantum-ui/DatePicker';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { useWorkspaceTimeZone } from '@vritti/quantum-ui/hooks';
import { TextArea } from '@vritti/quantum-ui/TextArea';
import { isoTodayDate } from '@vritti/quantum-ui/timezone';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import {
  type CreateGoodsReceiptFormData,
  createGoodsReceiptSchema,
  type GoodsReceiptData,
} from '@/schemas/goods-receipts';
import { PurchaseOrderSelector } from '@/selectors/purchase-order';
import type { UseCreateGoodsReceipt } from '../types';

interface CreateGoodsReceiptDialogProps {
  useCreateGoodsReceipt: UseCreateGoodsReceipt;
  purchaseOrderId?: string;
  onSuccess: (receipt: GoodsReceiptData) => void;
  onCancel: () => void;
}

// Starts a draft goods receipt against a purchase order — the one given, or one picked from the orders still open for
// receiving; its supplier and site come from the order
export const CreateGoodsReceiptDialog: React.FC<CreateGoodsReceiptDialogProps> = ({
  useCreateGoodsReceipt,
  purchaseOrderId,
  onSuccess,
  onCancel,
}) => {
  const timeZone = useWorkspaceTimeZone();
  const form = useForm<CreateGoodsReceiptFormData>({
    resolver: zodResolver(createGoodsReceiptSchema),
    defaultValues: { purchaseOrderId, receivedDate: isoTodayDate(timeZone), notes: '' },
  });
  const createMutation = useCreateGoodsReceipt({ onSuccess: (response) => onSuccess(response.data) });

  return (
    <Form form={form} mutation={createMutation} onCancel={onCancel}>
      {!purchaseOrderId && (
        <PurchaseOrderSelector name="purchaseOrderId" params={{ status: 'CONFIRMED,PARTIALLY_RECEIVED' }} />
      )}
      <DatePicker name="receivedDate" label="Received Date" />
      <TextArea name="notes" label="Notes" placeholder="Optional notes" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Creating...">
          Create Draft
        </Button>
      </DialogActions>
    </Form>
  );
};
