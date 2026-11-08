import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z, zodCurrencyField, zodNumericField } from '@vritti/quantum-ui/zod';
import type { GoodsReceiptItemFlagCode, GoodsReceiptStatus } from '@/schemas/goods-receipts';
import type { SupplierInvoiceFlagCode, SupplierInvoiceStatus } from '@/schemas/supplier-invoices';

export type PurchaseOrderStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'DRAFT'
  | 'SENT'
  | 'CONFIRMED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CLOSED'
  | 'CANCELLED';

export const RECEIVABLE_PURCHASE_ORDER_STATUSES: PurchaseOrderStatus[] = ['CONFIRMED', 'PARTIALLY_RECEIVED'];

export type ManualPurchaseOrderStatus = Extract<PurchaseOrderStatus, 'SENT' | 'CONFIRMED' | 'CLOSED' | 'CANCELLED'>;

export const purchaseOrderStatusConfig: Record<
  PurchaseOrderStatus,
  { label: string; variant: 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' }
> = {
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'outline' },
  APPROVED: { label: 'Approved', variant: 'secondary' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  DRAFT: { label: 'Draft', variant: 'outline' },
  SENT: { label: 'Sent', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  PARTIALLY_RECEIVED: { label: 'Partially Received', variant: 'warning' },
  RECEIVED: { label: 'Received', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'secondary' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

export const nextPurchaseOrderStatusAction: Partial<
  Record<PurchaseOrderStatus, { label: string; status: ManualPurchaseOrderStatus }>
> = {
  DRAFT: { label: 'Mark as Sent', status: 'SENT' },
  SENT: { label: 'Confirm Purchase Order', status: 'CONFIRMED' },
};

export interface PurchaseOrderData {
  id: string;
  legalEntityId: string;
  siteId: string;
  siteName?: string | null;
  siteCode?: string | null;
  supplierId: string;
  supplierName: string;
  poNumber: string;
  status: PurchaseOrderStatus;
  currencyCode: string;
  exchangeRate: number;
  conversionRates: Record<string, string>;
  orderDate: string;
  expectedBy: string | null;
  timezone: string;
  notes: string | null;
  totalAmount: CurrencyValue;
  hasPublishedGoodsReceipt: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PurchaseOrderDetail = PurchaseOrderData;

export interface PurchaseOrderItemData {
  id: string;
  purchaseOrderId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  uomId: string;
  orderUomSymbol: string | null;
  uomQty: number;
  expectedFreeQty: number;
  receivedQty: number;
  primaryUomQty: number;
  primaryUomSymbol: string | null;
  currencyCode: string;
  unitPrice: CurrencyValue;
  primaryUomUnitPrice: CurrencyValue;
  totalPrice: CurrencyValue;
  sourceUnitPrice: CurrencyValue | null;
  schemeBuyQty: number | null;
  schemeFreeQty: number | null;
  hasScheme: boolean;
}

export type PurchaseOrdersTableResponse = TableResponse<PurchaseOrderData>;
export type PurchaseOrderItemsTableResponse = TableResponse<PurchaseOrderItemData>;

interface PurchaseOrderProblemBase {
  detail: string;
  documentId: string;
  documentNumber: string;
  lotNumber: string | null;
}

export interface PurchaseOrderReceivingProblem extends PurchaseOrderProblemBase {
  source: 'GOODS_RECEIPT';
  code: GoodsReceiptItemFlagCode;
  documentStatus: GoodsReceiptStatus;
}

export interface PurchaseOrderInvoicingProblem extends PurchaseOrderProblemBase {
  source: 'SUPPLIER_INVOICE';
  code: SupplierInvoiceFlagCode;
  documentStatus: Exclude<SupplierInvoiceStatus, 'CANCELLED'>;
}

export type PurchaseOrderProblem = PurchaseOrderReceivingProblem | PurchaseOrderInvoicingProblem;

export interface PurchaseOrderLineProblems {
  purchaseOrderItemId: string;
  problems: PurchaseOrderProblem[];
}

export interface PurchaseOrderProblemsResponse {
  summary: { total: number; receiving: number; invoicing: number };
  lines: PurchaseOrderLineProblems[];
  orderProblems: PurchaseOrderProblem[];
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  siteId?: string;
  currencyCode: string;
  exchangeRate?: number;
  orderDate: string;
  expectedBy?: string | null;
  notes?: string;
}

export interface PurchaseOrderItemRef {
  id: string;
  itemId: string;
}

export interface AddPurchaseOrderItemPayload {
  id: string;
  supplierItemId: string;
  uomQty: number;
  unitPrice: CurrencyValue;
  conversionRate?: number;
  schemeBuyQty?: number;
  schemeFreeQty?: number;
  hasScheme: boolean;
}

export interface UpdatePurchaseOrderItemPayload extends PurchaseOrderItemRef {
  uomQty?: number;
  unitPrice?: CurrencyValue;
  schemeBuyQty?: number;
  schemeFreeQty?: number;
  hasScheme: boolean;
}

export interface UpdatePurchaseOrderNotesPayload {
  id: string;
  notes?: string | null;
}

export interface ChangePurchaseOrderSupplierPayload {
  id: string;
  supplierId: string;
  exchangeRate?: number;
}

export interface ChangePurchaseOrderExchangeRatePayload {
  id: string;
  exchangeRate: number;
}

export interface SetPurchaseOrderConversionRatePayload {
  id: string;
  currencyCode: string;
  rate: number;
}

export interface UpdatePurchaseOrderStatusPayload {
  id: string;
  status: ManualPurchaseOrderStatus;
}

export interface SendPurchaseOrderEmailPayload {
  id: string;
  email?: string | null;
}

const currencyCodeField = z.string({ error: 'Currency is required' }).regex(/^[A-Z]{3}$/, 'Currency is required');

// A rate is required exactly when the order is in another currency than the legal entity's; `requiresSite` adds the
// site picker of a legal entity raising an order for one of its sites
export function buildCreatePurchaseOrderSchema({
  leCurrencyCode,
  requiresSite,
}: {
  leCurrencyCode: string;
  requiresSite: boolean;
}) {
  return z
    .object({
      supplierId: z.uuid('Supplier is required'),
      siteId: requiresSite ? z.uuid('Site is required') : z.uuid().optional(),
      currencyCode: currencyCodeField,
      exchangeRate: zodNumericField({ positive: true, nonZero: true }).optional(),
      orderDate: z.string({ error: 'Order date is required' }).min(1, 'Order date is required'),
      expectedBy: z.string().nullable().optional(),
      notes: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.currencyCode === leCurrencyCode || data.exchangeRate != null) return;
      ctx.addIssue({
        code: 'custom',
        path: ['exchangeRate'],
        message: `Enter how much 1 ${data.currencyCode} is in ${leCurrencyCode}.`,
      });
    });
}

export type CreatePurchaseOrderFormData = z.infer<ReturnType<typeof buildCreatePurchaseOrderSchema>>;

const poSchemeShape = {
  schemeBuyQty: zodNumericField({ integer: true, positive: true }).optional(),
  schemeFreeQty: zodNumericField({ integer: true, positive: true }).optional(),
  hasScheme: z.boolean(),
};

// When a scheme is enabled, the buy/free ratio is required
function enforceSchemeRatio(
  data: { hasScheme: boolean; schemeBuyQty?: number | null; schemeFreeQty?: number | null },
  ctx: z.RefinementCtx,
) {
  if (!data.hasScheme) return;
  if (data.schemeBuyQty == null) {
    ctx.addIssue({ code: 'custom', path: ['schemeBuyQty'], message: 'Buy qty is required for a scheme.' });
  }
  if (data.schemeFreeQty == null) {
    ctx.addIssue({ code: 'custom', path: ['schemeFreeQty'], message: 'Free qty is required for a scheme.' });
  }
}

export const addPurchaseOrderItemSchema = z
  .object({
    supplierItemId: z.uuid('Item is required'),
    uomQty: zodNumericField({ required: 'Quantity is required', positive: true }),
    unitPrice: zodCurrencyField({ required: 'Unit price is required.' }),
    rateCurrency: z.string().optional(),
    conversionRate: zodNumericField({ positive: true, nonZero: true }).optional(),
    ...poSchemeShape,
  })
  .superRefine((data, ctx) => {
    enforceSchemeRatio(data, ctx);
    if (data.rateCurrency && data.conversionRate == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['conversionRate'],
        message: `Enter how much 1 ${data.rateCurrency} is in the PO currency.`,
      });
    }
  });

export type AddPurchaseOrderItemFormData = z.infer<typeof addPurchaseOrderItemSchema>;

// Pass `minQty` when the line has already been received against — the ordered quantity cannot drop below it
export function buildUpdatePurchaseOrderItemSchema(options: { minQty?: number } = {}) {
  const { minQty } = options;
  return z
    .object({
      uomQty: zodNumericField({
        required: 'Quantity is required',
        positive: true,
        ...(minQty != null && minQty > 0
          ? { min: minQty, minMessage: `Cannot be less than received quantity (${minQty}).` }
          : {}),
      }),
      unitPrice: zodCurrencyField({ required: 'Unit price is required.' }),
      ...poSchemeShape,
    })
    .superRefine(enforceSchemeRatio);
}

export type UpdatePurchaseOrderItemFormData = z.infer<ReturnType<typeof buildUpdatePurchaseOrderItemSchema>>;

export const setPurchaseOrderConversionRateSchema = z.object({
  currencyCode: currencyCodeField,
  rate: zodNumericField({ required: 'Rate is required', positive: true, nonZero: true }),
});

export type SetPurchaseOrderConversionRateFormData = z.infer<typeof setPurchaseOrderConversionRateSchema>;

export const changePurchaseOrderExchangeRateSchema = z.object({
  exchangeRate: zodNumericField({ required: 'Exchange rate is required', positive: true, nonZero: true }),
});

export type ChangePurchaseOrderExchangeRateFormData = z.infer<typeof changePurchaseOrderExchangeRateSchema>;

export const updatePurchaseOrderNotesSchema = z.object({
  notes: z.string(),
});

export type UpdatePurchaseOrderNotesFormData = z.infer<typeof updatePurchaseOrderNotesSchema>;

// `rateCurrency` is set when the new supplier moves the order into a foreign currency; its rate is then required
export const changePurchaseOrderSupplierSchema = z
  .object({
    supplierId: z.uuid('Supplier is required'),
    rateCurrency: z.string().optional(),
    exchangeRate: zodNumericField({ positive: true, nonZero: true }).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.rateCurrency || data.exchangeRate != null) return;
    ctx.addIssue({
      code: 'custom',
      path: ['exchangeRate'],
      message: `Enter how much 1 ${data.rateCurrency} is in the company's currency.`,
    });
  });

export type ChangePurchaseOrderSupplierFormData = z.infer<typeof changePurchaseOrderSupplierSchema>;

export const sendPurchaseOrderEmailSchema = z.object({
  email: z.email('Enter a valid email address').or(z.literal('')),
});

export type SendPurchaseOrderEmailFormData = z.infer<typeof sendPurchaseOrderEmailSchema>;
