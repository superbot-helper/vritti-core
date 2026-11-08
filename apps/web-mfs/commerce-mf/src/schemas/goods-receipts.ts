import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z, zodCurrencyField, zodNumericField } from '@vritti/quantum-ui/zod';
import type { InventoryTracking } from '@/schemas/inventory-items';

export const GoodsReceiptStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export type GoodsReceiptStatus = (typeof GoodsReceiptStatus)[keyof typeof GoodsReceiptStatus];

export const goodsReceiptStatusConfig: Record<GoodsReceiptStatus, { label: string; variant: 'outline' | 'success' }> = {
  DRAFT: { label: 'Draft', variant: 'outline' },
  PUBLISHED: { label: 'Published', variant: 'success' },
};

export interface GoodsReceiptPoData {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedBy: string | null;
  totalAmount: CurrencyValue;
}

export interface GoodsReceiptData {
  id: string;
  grNumber: string;
  legalEntityId: string;
  siteId: string;
  siteName?: string | null;
  siteCode?: string | null;
  supplierId: string;
  supplierName: string;
  status: GoodsReceiptStatus;
  isPublishable: boolean;
  itemCount: number;
  purchaseOrderId: string;
  po: GoodsReceiptPoData;
  receivedDate: string;
  notes: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export type GoodsReceiptItemFlagCode = 'OVER_RECEIVED' | 'SHORT_EXPIRY' | 'REJECTED';

export const goodsReceiptItemFlagLabels: Record<GoodsReceiptItemFlagCode, string> = {
  OVER_RECEIVED: 'Over-received',
  SHORT_EXPIRY: 'Short expiry',
  REJECTED: 'Rejected on arrival',
};

export interface GoodsReceiptItemFlag {
  code: GoodsReceiptItemFlagCode;
  detail: string;
}

export interface GoodsReceiptItemData {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  inventoryItemTracking: InventoryTracking;
  uomId: string;
  uomSymbol: string;
  uomAllowDecimal: boolean;
  primaryUomSymbol: string | null;
  receivedQty: number;
  rejectedQuantity: number;
  acceptedQty: number;
  distributedQty: number;
  orderedQty: number;
  expectedFreeQty: number;
  alreadyReceivedQty: number;
  poUnitPrice: CurrencyValue;
  lotsCount: number;
  linesCount: number;
  unbalancedLinesCount: number;
  flags: GoodsReceiptItemFlag[];
  createdAt: string;
}

export interface GoodsReceiptItemCostRow {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  uomSymbol: string;
  primaryUomSymbol: string | null;
  acceptedQty: number;
  acceptedPrimaryQty: number;
  unitCost: CurrencyValue;
  value: CurrencyValue;
}

export interface GoodsReceiptItemsCostData {
  rows: GoodsReceiptItemCostRow[];
  currencyCode: string;
  grandTotal: CurrencyValue;
}

export interface GoodsReceiptItemQuantRow {
  quantId: string;
  locationName: string | null;
  lotNumber: string | null;
  quantity: number;
  unitCost: CurrencyValue | null;
  totalCost: CurrencyValue | null;
  quantCost: CurrencyValue | null;
  quantValue: CurrencyValue | null;
}

export interface GoodsReceiptItemQuantsData {
  rows: GoodsReceiptItemQuantRow[];
  currencyCode: string | null;
  grandTotal: CurrencyValue | null;
}

export interface GoodsReceiptLotData {
  id: string;
  goodsReceiptItemId: string;
  lotNumber: string;
  manufacturingDate: string | null;
  expiryDate: string;
  resolvedLotId: string | null;
  mrp: CurrencyValue | null;
  linesCount: number;
  totalQuantity: number;
  createdAt: string;
}

export interface GoodsReceiptLineData {
  id: string;
  goodsReceiptItemId: string;
  goodsReceiptLotId: string | null;
  locationId: string;
  locationName: string | null;
  locationPath: string | null;
  lotNumber: string | null;
  manufacturingDate: string | null;
  expiryDate: string | null;
  quantity: number;
  primaryUomQty: number;
  primaryUomSymbol: string | null;
  resolvedQuantId: string | null;
  isBalanced: boolean;
  lineItemsCount: number;
  createdAt: string;
}

export interface GoodsReceiptLineItemData {
  id: string;
  goodsReceiptLineId: string;
  serialNumber: string;
  createdAt: string;
}

export interface GoodsReceiptTreeNode {
  id: string;
  name: string;
  kind: 'item' | 'lot' | 'line';
  balanced: boolean;
  badge: string;
  children?: GoodsReceiptTreeNode[];
}

export type GoodsReceiptsTableResponse = TableResponse<GoodsReceiptData>;
export type GoodsReceiptLinesTableResponse = TableResponse<GoodsReceiptLineData>;
export type GoodsReceiptLineItemsTableResponse = TableResponse<GoodsReceiptLineItemData>;

export interface CreateGoodsReceiptPayload {
  purchaseOrderId: string;
  receivedDate: string;
  notes?: string;
}

export interface AddGoodsReceiptItemPayload {
  purchaseOrderItemId: string;
  receivedQty: number;
  rejectedQuantity: number;
}

export interface UpdateGoodsReceiptItemPayload {
  receivedQty?: number;
  rejectedQuantity?: number;
}

export interface AddGoodsReceiptLotPayload {
  lotNumber: string;
  manufacturingDate?: string | null;
  expiryDate: string;
  mrp?: CurrencyValue | null;
}

export interface UpdateGoodsReceiptLotPayload {
  lotNumber?: string;
  manufacturingDate?: string | null;
  expiryDate?: string;
  mrp?: CurrencyValue | null;
}

export interface AddGoodsReceiptLinePayload {
  goodsReceiptLotId?: string | null;
  locationId: string;
  quantity: number;
}

export interface UpdateGoodsReceiptLinePayload {
  goodsReceiptLotId?: string | null;
  locationId?: string;
  quantity?: number;
}

export interface AddGoodsReceiptLineItemPayload {
  serialNumber: string;
}

export const createGoodsReceiptSchema = z.object({
  purchaseOrderId: z.uuid('Purchase order is required'),
  receivedDate: z.string({ error: 'Received date is required' }).min(1, 'Received date is required'),
  notes: z.string(),
});
export type CreateGoodsReceiptFormData = z.infer<typeof createGoodsReceiptSchema>;

// Received counts paid and free goods together; the rejected part of it never reaches stock
function receivedCountsShape(allowDecimal: boolean) {
  return {
    receivedQty: zodNumericField({ required: 'Received quantity is required', positive: true, integer: !allowDecimal }),
    rejectedQuantity: zodNumericField({ required: 'Rejected quantity is required', min: 0, integer: !allowDecimal }),
  };
}

// Rejects a rejected quantity larger than what was received
function enforceRejectedWithinReceived(data: { receivedQty: number; rejectedQuantity: number }, ctx: z.RefinementCtx) {
  if (data.rejectedQuantity <= data.receivedQty) return;
  ctx.addIssue({
    code: 'custom',
    path: ['rejectedQuantity'],
    message: 'Cannot be more than the received quantity.',
  });
}

// Whole numbers unless the PO line's unit allows decimals
export function buildAddGoodsReceiptItemSchema({ allowDecimal }: { allowDecimal: boolean }) {
  return z
    .object({
      purchaseOrderItemId: z.uuid('Purchase order line is required'),
      ...receivedCountsShape(allowDecimal),
    })
    .superRefine(enforceRejectedWithinReceived);
}
export type AddGoodsReceiptItemFormData = z.infer<ReturnType<typeof buildAddGoodsReceiptItemSchema>>;

// Whole numbers unless the item's unit allows decimals
export function buildUpdateGoodsReceiptItemSchema({ allowDecimal }: { allowDecimal: boolean }) {
  return z.object(receivedCountsShape(allowDecimal)).superRefine(enforceRejectedWithinReceived);
}
export type UpdateGoodsReceiptItemFormData = z.infer<ReturnType<typeof buildUpdateGoodsReceiptItemSchema>>;

export const goodsReceiptLotSchema = z
  .object({
    lotNumber: z.string({ error: 'Lot number is required' }).min(1, 'Lot number is required').max(100),
    manufacturingDate: z.string().nullable().optional(),
    expiryDate: z.string({ error: 'Expiry date is required' }).min(1, 'Expiry date is required'),
    mrp: zodCurrencyField({ positive: true }).optional(),
  })
  .refine((data) => !data.manufacturingDate || new Date(data.expiryDate) > new Date(data.manufacturingDate), {
    message: 'Expiry date must be after manufacturing date',
    path: ['expiryDate'],
  });
export type GoodsReceiptLotFormData = z.infer<typeof goodsReceiptLotSchema>;

// Quantity rules depend on the unit's allowDecimal, the undistributed quantity and the serials already on the line
export function buildGoodsReceiptLineSchema(options: { allowDecimal: boolean; min?: number; max?: number }) {
  return z.object({
    goodsReceiptLotId: z.uuid().optional(),
    locationId: z.uuid('Location is required'),
    quantity: zodNumericField({
      required: 'Quantity is required',
      positive: true,
      integer: !options.allowDecimal,
      ...(options.min != null
        ? { min: options.min, minMessage: `Cannot be less than the ${options.min} serials already on this line.` }
        : {}),
      ...(options.max != null ? { max: options.max } : {}),
    }),
  });
}
export type GoodsReceiptLineFormData = z.infer<ReturnType<typeof buildGoodsReceiptLineSchema>>;

export const addGoodsReceiptLineItemSchema = z.object({
  serialNumber: z.string({ error: 'Serial number is required' }).min(1, 'Serial number is required').max(100),
});
export type AddGoodsReceiptLineItemFormData = z.infer<typeof addGoodsReceiptLineItemSchema>;
