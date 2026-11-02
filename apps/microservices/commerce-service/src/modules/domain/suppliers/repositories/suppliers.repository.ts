import {
  type SiteEnrollmentStatus,
  SiteEnrollmentStatusValues,
} from '@domain/supplier-sites/dto/entity/site-supplier-list-row.dto';
import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, desc, eq, getColumns, inArray, notInArray, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { pluralize } from '@vritti/api-sdk/pluralize';
import { type FindForSelectConfig, type SelectQueryResult } from '@vritti/api-sdk/select';
import {
  type PartyLicense,
  type PartyTaxRegistration,
  type PartyType,
  PurchaseOrderStatusValues,
  parties,
  partyLicenses,
  partyTaxRegistrations,
  paymentTerms,
  purchaseOrders,
  type Supplier,
  supplierItemPrices,
  supplierItems,
  supplierQuotations,
  supplierSites,
  suppliers,
} from '@/db/schema';

// Narrows a supplier pick list to the suppliers with a price for an inventory item at a site within a date window
export interface PricedItemAtSite {
  inventoryItemId: string;
  siteId: string;
  from?: string;
  to?: string;
}

export type SupplierWithParty = Supplier & { partyName: string; defaultPaymentTermName: string };

export type SupplierDetailRow = SupplierWithParty & {
  partyType: PartyType;
  registrations: PartyTaxRegistration[];
  licenses: PartyLicense[];
  enrolledSiteCount: number;
  itemCount: number;
};

// Purchase orders that are done with and no longer hold a supplier to their currency
const CLOSED_PURCHASE_ORDER_STATUSES = [
  PurchaseOrderStatusValues.RECEIVED,
  PurchaseOrderStatusValues.CLOSED,
  PurchaseOrderStatusValues.CANCELLED,
  PurchaseOrderStatusValues.REJECTED,
];

@Injectable()
export class SuppliersDomainRepository extends PrimaryBaseRepository<typeof suppliers> {
  constructor(database: PrimaryDatabaseService) {
    super(database, suppliers);
  }

  // Paginated supplier options; given a site, each option carries its enrollment status there (`enrollmentStatus`
  // additional) and `enrollmentStatus` narrows to enrolled or not-enrolled suppliers
  override findForSelect(
    config: FindForSelectConfig,
    options?: { siteId?: string; enrollmentStatus?: SiteEnrollmentStatus; pricedItem?: PricedItemAtSite },
  ): Promise<SelectQueryResult> {
    const siteId = options?.siteId;
    const enrolledAtSite = siteId
      ? sql`EXISTS (SELECT 1 FROM ${supplierSites} ss WHERE ss.supplier_id = ${suppliers.id} AND ss.site_id = ${siteId}::uuid)`
      : undefined;
    const conditions: SQL[] = [];
    if (enrolledAtSite && options?.enrollmentStatus) {
      conditions.push(
        options.enrollmentStatus === SiteEnrollmentStatusValues.ENROLLED ? enrolledAtSite : sql`NOT ${enrolledAtSite}`,
      );
    }
    const priced = options?.pricedItem;
    if (priced) {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM ${supplierItemPrices}
        INNER JOIN ${supplierItems} ON ${supplierItems.id} = ${supplierItemPrices.supplierItemId}
        WHERE ${supplierItems.supplierId} = ${suppliers.id}
          AND ${supplierItems.inventoryItemId} = ${priced.inventoryItemId}
          AND ${supplierItemPrices.siteId} = ${priced.siteId}
          ${priced.to ? sql`AND ${supplierItemPrices.validFrom} <= ${priced.to}::date` : sql``}
          ${priced.from ? sql`AND (${supplierItemPrices.validTo} IS NULL OR ${supplierItemPrices.validTo} >= ${priced.from}::date)` : sql``}
      )`);
    }

    return super.findForSelect({
      ...config,
      joins: [{ table: parties, on: eq(parties.id, suppliers.partyId), type: 'inner' }],
      conditions,
      additionalExpressions: enrolledAtSite
        ? {
            enrollmentStatus: sql<SiteEnrollmentStatus>`CASE WHEN ${enrolledAtSite} THEN ${SiteEnrollmentStatusValues.ENROLLED} ELSE ${SiteEnrollmentStatusValues.NOT_ENROLLED} END`,
          }
        : undefined,
    });
  }

  // Returns paginated suppliers joined with their party display name, plus total count
  findAllWithParty(options?: { where?: SQL; orderBy?: SQL[]; limit?: number; offset?: number }): Promise<{
    result: SupplierWithParty[];
    count: number;
  }> {
    return this.findAllAndCount<SupplierWithParty>({
      select: { ...getColumns(suppliers), partyName: parties.displayName, defaultPaymentTermName: paymentTerms.name },
      innerJoins: [
        { table: parties, on: eq(parties.id, suppliers.partyId) },
        { table: paymentTerms, on: eq(paymentTerms.id, suppliers.defaultPaymentTermId) },
      ],
      where: options?.where,
      orderBy: options?.orderBy,
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  // Loads a supplier by id joined with its party display name
  async findByIdWithParty(id: string): Promise<SupplierWithParty | undefined> {
    const { result } = await this.findAllWithParty({ where: eq(suppliers.id, id), limit: 1, offset: 0 });
    return result[0];
  }

  // Loads a supplier by id, throwing when it does not exist
  async findByIdOrThrow(id: string): Promise<Supplier> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('Supplier not found.');
    return entity;
  }

  // Loads a supplier joined with its party display name, throwing when it does not exist
  async findWithPartyOrThrow(id: string): Promise<SupplierWithParty> {
    const entity = await this.findByIdWithParty(id);
    if (!entity) throw new NotFoundException('Supplier not found.');
    return entity;
  }

  // Loads a supplier with party name, the party's registrations and licenses, and its enrollment and item counts
  async findDetailOrThrow(id: string): Promise<SupplierDetailRow> {
    const [row] = await this.db
      .select({
        ...getColumns(suppliers),
        partyName: parties.displayName,
        partyType: parties.partyType,
        defaultPaymentTermName: paymentTerms.name,
        enrolledSiteCount: sql<number>`(
          SELECT count(*)::int FROM ${supplierSites} ss
          WHERE ss.supplier_id = ${suppliers}.id
        )`.mapWith(Number),
        itemCount: sql<number>`(
          SELECT count(*)::int FROM ${supplierItems} si
          WHERE si.supplier_id = ${suppliers}.id
        )`.mapWith(Number),
      })
      .from(suppliers)
      .innerJoin(parties, eq(parties.id, suppliers.partyId))
      .innerJoin(paymentTerms, eq(paymentTerms.id, suppliers.defaultPaymentTermId))
      .where(eq(suppliers.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Supplier not found.');

    const supplier = row as Omit<SupplierDetailRow, 'registrations' | 'licenses'>;
    const [registrations, licenses] = await Promise.all([
      this.db
        .select()
        .from(partyTaxRegistrations)
        .where(eq(partyTaxRegistrations.partyId, supplier.partyId))
        .orderBy(desc(partyTaxRegistrations.isPrimary), asc(partyTaxRegistrations.createdAt)),
      this.db
        .select()
        .from(partyLicenses)
        .where(eq(partyLicenses.partyId, supplier.partyId))
        .orderBy(asc(partyLicenses.createdAt)),
    ]);

    return {
      ...supplier,
      registrations: registrations as PartyTaxRegistration[],
      licenses: licenses as PartyLicense[],
    };
  }

  // Rejects a default payment term that is not a published term of the caller's organization
  async assertPaymentTermUsable(id: string | null | undefined): Promise<void> {
    if (!id) return;
    const [term] = await this.db
      .select({ isPublished: paymentTerms.isPublished })
      .from(paymentTerms)
      .where(eq(paymentTerms.id, id))
      .limit(1);
    if (term?.isPublished === true) return;
    throw new BadRequestException({
      label: 'Invalid Payment Term',
      detail: 'The selected default payment term does not exist or is still a draft.',
      errors: [{ field: 'defaultPaymentTermId', message: 'Pick a published payment term' }],
    });
  }

  // Rejects a party that is already a supplier of the caller's legal entity
  async assertPartyFree(partyId: string): Promise<void> {
    if (!(await this.exists(eq(suppliers.partyId, partyId)))) return;
    throw new ConflictException({
      label: 'Already A Supplier',
      detail: 'This company is already a supplier for this legal entity.',
      errors: [{ field: 'partyId', message: 'Already a supplier' }],
    });
  }

  // Rejects deleting a supplier that purchase orders, quotations or item prices still reference
  async assertNotReferenced(supplier: SupplierWithParty): Promise<void> {
    const refs = await this.countReferences(supplier.id);
    const parts = (
      [
        [refs.purchaseOrders, 'purchase order'],
        [refs.quotations, 'quotation'],
        [refs.prices, 'item price'],
      ] as const
    )
      .filter(([n]) => n > 0)
      .map(([n, label]) => `${n} ${pluralize(label, n)}`);
    if (parts.length === 0) return;
    throw new ConflictException({
      label: 'Supplier In Use',
      detail: `Cannot delete "${supplier.partyName}" — it is referenced by ${parts.join(', ')}. Remove those references first.`,
    });
  }

  // Rejects dropping currencies still used by the supplier's prices, quotations or open purchase orders
  async assertCurrenciesUnused(id: string, dropped: string[]): Promise<void> {
    if (dropped.length === 0) return;
    const usage = await this.countCurrencyUsage(id, dropped);
    const uses = (
      [
        ['price', usage.prices],
        ['quotation', usage.quotations],
        ['open purchase order', usage.purchaseOrders],
      ] as const
    )
      .filter(([, count]) => count > 0)
      .map(([noun, count]) => pluralize(noun, count, true));
    if (uses.length === 0) return;
    throw new ConflictException({
      label: 'Currency In Use',
      detail: `${dropped.join(', ')} cannot be removed while ${uses.join(', ')} of this supplier use it.`,
      errors: [{ field: 'currencyCodes', message: `${dropped.join(', ')} is still in use` }],
    });
  }

  // Counts the purchase orders, quotations and item prices that keep a supplier from being deleted
  async countReferences(id: string): Promise<{ purchaseOrders: number; quotations: number; prices: number }> {
    const count = sql<number>`count(*)::int`.mapWith(Number);
    const [[orders], [quotations], [prices]] = await Promise.all([
      this.db.select({ count }).from(purchaseOrders).where(eq(purchaseOrders.supplierId, id)),
      this.db.select({ count }).from(supplierQuotations).where(eq(supplierQuotations.supplierId, id)),
      this.db
        .select({ count })
        .from(supplierItemPrices)
        .innerJoin(supplierItems, eq(supplierItems.id, supplierItemPrices.supplierItemId))
        .where(eq(supplierItems.supplierId, id)),
    ]);
    return {
      purchaseOrders: orders?.count ?? 0,
      quotations: quotations?.count ?? 0,
      prices: prices?.count ?? 0,
    };
  }

  // How many of the supplier's prices, quotations and open purchase orders are in any of the given currencies
  async countCurrencyUsage(
    id: string,
    currencyCodes: string[],
  ): Promise<{ prices: number; quotations: number; purchaseOrders: number }> {
    const count = sql<number>`count(*)::int`.mapWith(Number);
    const [[prices], [quotations], [orders]] = await Promise.all([
      this.db
        .select({ count })
        .from(supplierItemPrices)
        .innerJoin(supplierItems, eq(supplierItems.id, supplierItemPrices.supplierItemId))
        .where(and(eq(supplierItems.supplierId, id), inArray(supplierItemPrices.currencyCode, currencyCodes))),
      this.db
        .select({ count })
        .from(supplierQuotations)
        .where(and(eq(supplierQuotations.supplierId, id), inArray(supplierQuotations.currencyCode, currencyCodes))),
      this.db
        .select({ count })
        .from(purchaseOrders)
        .where(
          and(
            eq(purchaseOrders.supplierId, id),
            inArray(purchaseOrders.currencyCode, currencyCodes),
            notInArray(purchaseOrders.status, CLOSED_PURCHASE_ORDER_STATUSES),
          ),
        ),
    ]);
    return { prices: prices?.count ?? 0, quotations: quotations?.count ?? 0, purchaseOrders: orders?.count ?? 0 };
  }

  // Activates or deactivates suppliers by ID; returns how many changed
  async bulkSetActive(ids: string[], isActive: boolean): Promise<number> {
    const rows = await this.db
      .update(suppliers)
      .set({ isActive })
      .where(inArray(suppliers.id, ids))
      .returning({ id: suppliers.id });
    return rows.length;
  }
}
