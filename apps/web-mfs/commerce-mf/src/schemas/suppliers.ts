import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z, zodCurrencyField, zodNumericField } from '@vritti/quantum-ui/zod';
import type { IdentifierType } from './party-identifiers';
import type { PartyLicenseType } from './party-licenses';

const currencyCodeField = z.string({ error: 'Currency is required' }).regex(/^[A-Z]{3}$/, 'Currency is required');
const currencyCodesField = z
  .array(currencyCodeField, { error: 'Select at least one currency' })
  .min(1, 'Select at least one currency');

// The default currency is one of the supplier's currencies
const defaultCurrencyListed = {
  check: (data: { currencyCode: string; currencyCodes: string[] }) => data.currencyCodes.includes(data.currencyCode),
  params: { path: ['currencyCode'], message: 'Pick the default from the selected currencies' },
};

export const createSupplierSchema = z
  .object({
    partyId: z.uuid('Supplier is required'),
    code: z.string().min(1, 'Code is required').max(100),
    currencyCodes: currencyCodesField,
    currencyCode: currencyCodeField,
    defaultPaymentTermId: z.uuid('Default payment term is required'),
    notes: z.string().optional(),
    purchasingBlocked: z.boolean(),
    paymentBlocked: z.boolean(),
    isActive: z.boolean(),
  })
  .refine(defaultCurrencyListed.check, defaultCurrencyListed.params);

export const updateSupplierSchema = z.object({
  code: z.string().min(1).max(100).optional(),
  notes: z.string().nullable().optional(),
});

const siteIdsField = z.array(z.uuid(), { error: 'Select at least one site' }).min(1, 'Select at least one site');

export const addSupplierItemSchema = z.object({
  inventoryItemId: z.uuid('Inventory item is required'),
  supplierItemCode: z.string().max(100).optional(),
  uomId: z.uuid('Unit of measure is required'),
  minOrderQuantity: zodNumericField({ positive: true }).optional(),
  defaultLeadTimeDays: zodNumericField({ integer: true, positive: true }).optional(),
  siteIds: siteIdsField,
});

export const updateSupplierItemSchema = z.object({
  supplierItemCode: z.string().max(100).optional(),
  uomId: z.uuid('Unit of measure is required'),
  minOrderQuantity: zodNumericField({ positive: true, nullable: true }).optional(),
  defaultLeadTimeDays: zodNumericField({ integer: true, positive: true, nullable: true }).optional(),
});

export const setSupplierSiteItemPreferredSchema = z.object({
  siteIds: siteIdsField,
  isPreferred: z.boolean(),
});

export type SetSupplierSiteItemPreferredFormData = z.infer<typeof setSupplierSiteItemPreferredSchema>;

export const setSupplierItemMinOrderSchema = z.object({
  minOrderQuantity: zodNumericField({ positive: true, nullable: true }).optional(),
});

export type SetSupplierItemMinOrderFormData = z.infer<typeof setSupplierItemMinOrderSchema>;

export const setSupplierItemDefaultLeadTimeSchema = z.object({
  defaultLeadTimeDays: zodNumericField({ integer: true, positive: true, nullable: true }).optional(),
});

export type SetSupplierItemDefaultLeadTimeFormData = z.infer<typeof setSupplierItemDefaultLeadTimeSchema>;

export type CreateSupplierFormData = z.infer<typeof createSupplierSchema>;
export const editSupplierFormSchema = updateSupplierSchema.extend({
  partyId: z.uuid(),
  currencyCode: z.string(),
});

export type UpdateSupplierFormData = z.infer<typeof updateSupplierSchema>;
export type EditSupplierFormData = z.infer<typeof editSupplierFormSchema>;
export type AddSupplierItemFormData = z.infer<typeof addSupplierItemSchema>;
export type UpdateSupplierItemFormData = z.infer<typeof updateSupplierItemSchema>;
export type SuppliersTableResponse = TableResponse<SupplierData>;
export type SupplierItemsTableResponse = TableResponse<SupplierItemData>;
export type SupplierSiteItemDataTableResponse = TableResponse<SupplierSiteItemData>;

export interface SupplierData {
  id: string;
  partyId: string;
  partyName: string;
  partyType: 'COMPANY' | 'PERSON';
  code: string;
  // The default currency; new items, quotations and POs start in it
  currencyCode: string;
  // Every currency the supplier trades in, the default included
  currencyCodes: string[];
  defaultPaymentTermId: string;
  defaultPaymentTermName: string;
  notes: string | null;
  purchasingBlocked: boolean;
  paymentBlocked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SupplierPartyType = SupplierData['partyType'];

export const SUPPLIER_PARTY_TYPE_OPTIONS: { value: SupplierPartyType; label: string }[] = [
  { value: 'COMPANY', label: 'Company' },
  { value: 'PERSON', label: 'Person' },
];

export interface SupplierRegistrationData {
  id: string;
  registrationNumber: string;
  registrationType: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface SupplierLicenseData {
  id: string;
  licenseType: PartyLicenseType;
  licenseNumber: string;
  region: string | null;
  validTo: string | null;
  isActive: boolean;
}

export interface SupplierItemData {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  supplierItemCode: string | null;
  uomId: string;
  uomSymbol: string;
  // The least the supplier sells per order, in the item's unit
  minOrderQuantity: number | null;
  // Days from order to delivery, which every site follows unless it sets its own
  defaultLeadTimeDays: number | null;
  siteCount: number;
  // Sites where this supplier is the preferred one for the item
  preferredSiteCount: number;
}

export interface SupplierSiteItemTerms {
  supplierSiteItemId: string | null;
  isPreferred: boolean;
  leadTimeDays: number | null;
  // True when the site sets its own lead time instead of following the supplier item's default
  isLeadTimeOverridden: boolean;
  minOrderQuantity: number | null;
  unitPrice: CurrencyValue | null;
  schemeBuyQty: number | null;
  schemeFreeQty: number | null;
  hasScheme: boolean;
  taxInclusive: boolean;
}

export interface SupplierSiteItemData extends SupplierItemData, SupplierSiteItemTerms {}

export interface SupplierSiteItemDetail extends SupplierSiteItemData {
  supplierId: string;
  supplierCode: string;
  // The supplier's default currency, which new prices start in, and every currency a price may be in
  supplierCurrencyCode: string;
  supplierCurrencyCodes: string[];
}

export interface SupplierItemDetail extends SupplierItemData {
  supplierId: string;
  supplierCode: string;
  // The supplier's default currency, which new prices start in, and every currency a price may be in
  supplierCurrencyCode: string;
  supplierCurrencyCodes: string[];
  // Price history: an item with any can neither be deleted nor change its unit
  priceCount: number;
  pricedSiteCount: number;
  canDelete: boolean;
}

export interface InventoryItemSupplierData extends SupplierSiteItemTerms {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  supplierItemCode: string | null;
  uomId: string;
  uomSymbol: string;
  // Sites the supplier item is set up at
  siteCount: number;
}

export type InventoryItemSuppliersTableResponse = TableResponse<InventoryItemSupplierData>;

export interface SupplierDetail extends SupplierData {
  partyTaxId: string | null;
  partyTaxIdType: IdentifierType | null;
  registrations: SupplierRegistrationData[];
  licenses: SupplierLicenseData[];
  enrolledSiteCount: number;
  itemCount: number;
}

export const changeSupplierCurrencySchema = z
  .object({ currencyCodes: currencyCodesField, currencyCode: currencyCodeField })
  .refine(defaultCurrencyListed.check, defaultCurrencyListed.params);

export type ChangeSupplierCurrencyFormData = z.infer<typeof changeSupplierCurrencySchema>;

export const setSupplierDefaultPaymentTermSchema = z.object({
  defaultPaymentTermId: z.uuid('Default payment term is required'),
});

export type SetSupplierDefaultPaymentTermFormData = z.infer<typeof setSupplierDefaultPaymentTermSchema>;

const PRICE_SOURCES = ['QUOTATION', 'MANUAL'] as const;
export type SupplierPriceSource = (typeof PRICE_SOURCES)[number];
export const PRICE_SOURCE_LABELS: Record<SupplierPriceSource, string> = {
  QUOTATION: 'Quotation',
  MANUAL: 'Manual',
};

export interface SupplierItemPriceRow {
  id: string;
  supplierItemId: string;
  legalEntityId: string;
  siteId: string;
  unitPrice: CurrencyValue;
  mrpId: string | null;
  mrp: CurrencyValue | null;
  schemeBuyQty: number | null;
  schemeFreeQty: number | null;
  taxInclusive: boolean;
  validFrom: string;
  validTo: string | null;
  source: SupplierPriceSource;
  // Set when a quotation posted the price; it then changes only through the quotation
  quotationSiteId: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

// One site's price timeline of an LE supplier item
// A supplier item's price timeline at one site
export type SupplierItemPricesTableResponse = TableResponse<SupplierItemPriceRow>;

// The session site's price timeline of a supplier item
export type SupplierSiteItemPricesTableResponse = TableResponse<SupplierItemPriceRow>;

// A price row of one supplier for an inventory item, with the supplier and the unit the price is per
export interface ItemSupplierPriceRow extends SupplierItemPriceRow {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  uomSymbol: string | null;
}

export type ItemSupplierPricesTableResponse = TableResponse<ItemSupplierPriceRow>;

export interface PriceWindow {
  id: string;
  unitPrice: CurrencyValue;
  validFrom: string;
  validTo: string | null;
}

export interface SitePriceHistory {
  siteId: string;
  siteName?: string | null;
  siteCode?: string | null;
  current: PriceWindow | null;
  previous: PriceWindow | null;
  next: PriceWindow | null;
  windows: PriceWindow[];
}

// One supplier's prices for an inventory item at a site, converted to the item's primary unit
export interface ItemSupplierPriceHistory {
  supplierId: string;
  supplierItemId: string;
  supplierName: string;
  supplierCode: string;
  quotedUomSymbol: string | null;
  current: PriceWindow | null;
  previous: PriceWindow | null;
  next: PriceWindow | null;
  windows: PriceWindow[];
}

export interface InventoryItemPriceHistory {
  siteId: string | null;
  // Every supplier's prices are per this unit
  uomSymbol: string | null;
  // The suppliers drawn: the ones asked for, or by default the preferred then most recently priced; at most 8
  suppliers: ItemSupplierPriceHistory[];
  // Every supplier with a price for the item at the site within the window
  supplierCount: number;
}

// What a price graph shows, as saved in its live table state; empty supplier ids means the server chose the ones drawn
export interface PriceGraphSelection {
  siteId: string | null;
  from: string;
  to: string;
  supplierIds: string[];
  mrpIds: string[];
  currency: string | null;
}

export interface InventoryItemPriceGraph extends InventoryItemPriceHistory {
  selection: PriceGraphSelection;
}

// One supplier item's standing for an inventory item at a site on a date: the price in force per its own unit and per
// the item's primary unit, what its scheme makes it cost, and how it last moved
export interface ItemSupplierPriceComparisonRow {
  supplierItemId: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  quotedUomSymbol: string | null;
  isPreferred: boolean;
  currentPrice: CurrencyValue | null;
  currentFrom: string | null;
  currentTo: string | null;
  effectivePrice: CurrencyValue | null;
  pricePerPrimary: CurrencyValue | null;
  effectivePricePerPrimary: CurrencyValue | null;
  schemeBuyQty: number | null;
  schemeFreeQty: number | null;
  mrp: CurrencyValue | null;
  previousPrice: CurrencyValue | null;
  changePercent: number | null;
  priceCount: number;
}

export type ItemSupplierPriceComparisonTableResponse = TableResponse<ItemSupplierPriceComparisonRow> & {
  // Sites the item has supplier prices at, and the one the table shows when none is picked
  siteIds: string[];
  defaultSiteId: string | null;
  // The site the rows are at: the one asked for when the item is priced there, else the default
  siteId: string | null;
};

// What the prices table is about — set in its context bar, not saved: a site (the default when omitted) and a day, as
// YYYY-MM-DD or yesterday / today / tomorrow
export interface PricesTableContext {
  site?: string;
  asOf: string;
}

// Each window carries its own currency; a supplier can requote an item in another of its currencies
export interface SupplierItemPriceHistory {
  sites: SitePriceHistory[];
}

const supplierItemPriceFields = {
  unitPrice: zodCurrencyField({ required: 'Unit price is required', positive: true }),
  mrpId: z.uuid().optional(),
  schemeBuyQty: zodNumericField({ integer: true, positive: true, nullable: true }).optional(),
  schemeFreeQty: zodNumericField({ integer: true, positive: true, nullable: true }).optional(),
  taxInclusive: z.boolean(),
  validFrom: z.string({ error: 'Valid from is required' }).min(1, 'Valid from is required'),
  validTo: z.string().nullable().optional(),
  note: z.string().max(500, 'Note must be at most 500 characters'),
};

const validToAfterValidFrom = {
  check: (data: { validFrom: string; validTo?: string | null }) =>
    !data.validTo || new Date(data.validTo) >= new Date(data.validFrom),
  params: { message: 'Valid to must be on or after valid from', path: ['validTo'] },
};

export const addSupplierItemPriceSchema = z
  .object(supplierItemPriceFields)
  .refine(validToAfterValidFrom.check, validToAfterValidFrom.params);

export const addLeSupplierItemPriceSchema = z
  .object({
    ...supplierItemPriceFields,
    siteIds: siteIdsField,
  })
  .refine(validToAfterValidFrom.check, validToAfterValidFrom.params);

export const updateSupplierItemPriceSchema = z.object({
  unitPrice: zodCurrencyField({ required: 'Unit price is required', positive: true }),
  mrpId: z.uuid().optional(),
  schemeBuyQty: zodNumericField({ integer: true, positive: true, nullable: true }).optional(),
  schemeFreeQty: zodNumericField({ integer: true, positive: true, nullable: true }).optional(),
  taxInclusive: z.boolean(),
  validTo: z.string().optional(),
});

export type AddSupplierItemPriceFormData = z.infer<typeof addSupplierItemPriceSchema>;
export type AddLeSupplierItemPriceFormData = z.infer<typeof addLeSupplierItemPriceSchema>;
export type UpdateSupplierItemPriceFormData = z.infer<typeof updateSupplierItemPriceSchema>;

export interface SupplierSiteItemRow {
  id: string;
  supplierItemId: string;
  legalEntityId: string;
  siteId: string;
  inventoryItemId: string;
  siteName: string | null;
  siteCode: string | null;
  isPreferred: boolean;
  leadTimeDays: number | null;
  // True when the site sets its own lead time instead of following the supplier item's default
  isLeadTimeOverridden: boolean;
  createdAt: string;
}

export type SupplierSiteItemsTableResponse = TableResponse<SupplierSiteItemRow>;

export const addSupplierSiteItemSchema = z.object({
  siteId: z.uuid('Site is required'),
  isPreferred: z.boolean(),
  leadTimeDays: zodNumericField({ integer: true, positive: true }).optional(),
});

export const updateSupplierSiteItemSchema = z.object({
  isPreferred: z.boolean(),
  // On: the site follows the supplier item's default lead time; off: the lead time below is the site's own
  followDefaultLeadTime: z.boolean(),
  leadTimeDays: zodNumericField({ integer: true, positive: true, nullable: true }).optional(),
});

export type AddSupplierSiteItemFormData = z.infer<typeof addSupplierSiteItemSchema>;
export type UpdateSupplierSiteItemFormData = z.infer<typeof updateSupplierSiteItemSchema>;

export interface AddSupplierSiteItemPayload {
  siteId: string;
  isPreferred?: boolean;
  leadTimeDays?: number;
}

export interface UpdateSupplierSiteItemPayload {
  isPreferred?: boolean;
  leadTimeDays?: number | null;
  followDefaultLeadTime?: boolean;
}

export interface UpdateSupplierSiteItemVars {
  supplierSiteItemId: string;
  data: UpdateSupplierSiteItemPayload;
}

export interface BulkSetSupplierSiteItemPreferredPayload {
  supplierItemIds: string[];
  siteIds: string[];
  isPreferred: boolean;
}

export interface AddSupplierSiteItemPricePayload {
  unitPrice?: CurrencyValue;
  mrpId?: string;
  schemeBuyQty?: number;
  schemeFreeQty?: number;
  taxInclusive?: boolean;
  validFrom: string;
  validTo?: string | null;
  note?: string;
}

export interface UpdateSupplierSiteItemPricePayload {
  unitPrice?: CurrencyValue;
  mrpId?: string | null;
  schemeBuyQty?: number | null;
  schemeFreeQty?: number | null;
  taxInclusive?: boolean;
  validTo?: string | null;
}
