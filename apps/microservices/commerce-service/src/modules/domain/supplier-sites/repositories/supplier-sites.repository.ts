import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, desc, eq, getColumns, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { alias } from '@vritti/api-sdk/drizzle-pg-core';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import {
  type PartyBankAccount,
  type PartyCommunicationChannel,
  PartyCommunicationChannelValues,
  PartyFunctionTypeValues,
  type PartyRelationship,
  type PartyTaxRegistration,
  type PaymentTerm,
  parties,
  partyBankAccounts,
  partyCommunications,
  partyFunctions,
  partyRelationships,
  partyTaxRegistrations,
  paymentTerms,
  type Supplier,
  type SupplierSite,
  supplierSites,
  suppliers,
  type TaxRegistrationType,
} from '@/db/schema';

const orderRel = alias(partyRelationships, 'order_rel');
const orderParty = alias(parties, 'order_party');
const orderContactEmail = alias(partyCommunications, 'order_contact_email');
const orderContactPhone = alias(partyCommunications, 'order_contact_phone');
const orderEmail = alias(partyCommunications, 'order_email');
const orderPhone = alias(partyCommunications, 'order_phone');

const orderContactJoins = [
  { table: orderRel, on: eq(orderRel.id, supplierSites.orderRelationshipId) },
  { table: orderParty, on: eq(orderParty.id, orderRel.childPartyId) },
  {
    table: orderContactEmail,
    on: and(
      eq(orderContactEmail.partyId, orderRel.childPartyId),
      eq(orderContactEmail.channel, PartyCommunicationChannelValues.EMAIL),
      eq(orderContactEmail.isPrimary, true),
    ),
  },
  {
    table: orderContactPhone,
    on: and(
      eq(orderContactPhone.partyId, orderRel.childPartyId),
      eq(orderContactPhone.channel, PartyCommunicationChannelValues.PHONE),
      eq(orderContactPhone.isPrimary, true),
    ),
  },
  { table: orderEmail, on: eq(orderEmail.id, supplierSites.orderEmailCommunicationId) },
  { table: orderPhone, on: eq(orderPhone.id, supplierSites.orderPhoneCommunicationId) },
];

const orderContactSelect = {
  orderContactLabel: orderRel.jobTitle,
  orderContactName: orderParty.displayName,
  orderContactEmail: orderContactEmail.value,
  orderContactPhone: orderContactPhone.value,
  orderEmail: orderEmail.value,
  orderPhone: orderPhone.value,
};

const ORDER_COMMUNICATION_FIELDS = {
  [PartyCommunicationChannelValues.EMAIL]: {
    field: 'orderEmailCommunicationId',
    label: 'Invalid Order Email',
    noun: 'email address',
  },
  [PartyCommunicationChannelValues.PHONE]: {
    field: 'orderPhoneCommunicationId',
    label: 'Invalid Order Phone',
    noun: 'phone number',
  },
} as const;

export type SiteSupplierListRow = Supplier & {
  partyName: string;
  enrollmentId: string | null;
  paymentTermId: string | null;
  paymentTermName: string | null;
  orderEmailCommunicationId: string | null;
  orderPhoneCommunicationId: string | null;
  orderEmail: string | null;
  orderPhone: string | null;
  enrolledAt: Date | null;
};

export type SupplierAtSiteRow = SiteSupplierListRow & {
  partyTaxRegistrationId: string | null;
  registrationNumber: string | null;
  partyBankAccountId: string | null;
  bankAccountName: string | null;
  orderRelationshipId: string | null;
};

export type SupplierSiteWithPicks = SupplierSite & {
  paymentTermName: string | null;
  registrationNumber: string | null;
  registrationType: TaxRegistrationType | null;
  bankAccountName: string | null;
  bankName: string | null;
  orderContactLabel: string | null;
  orderContactName: string | null;
  orderContactEmail: string | null;
  orderContactPhone: string | null;
  orderEmail: string | null;
  orderPhone: string | null;
};

@Injectable()
export class SupplierSitesDomainRepository extends PrimaryBaseRepository<typeof supplierSites> {
  constructor(database: PrimaryDatabaseService) {
    super(database, supplierSites);
  }

  // Returns enrollments joined with their payment term, registration, bank account, order contact and order email/phone
  private findWithPicks(where: SQL, limit?: number): Promise<{ result: SupplierSiteWithPicks[]; count: number }> {
    return this.findAllAndCount<SupplierSiteWithPicks>({
      select: {
        ...getColumns(supplierSites),
        paymentTermName: paymentTerms.name,
        registrationNumber: partyTaxRegistrations.registrationNumber,
        registrationType: partyTaxRegistrations.registrationType,
        bankAccountName: partyBankAccounts.accountName,
        bankName: partyBankAccounts.bankName,
        ...orderContactSelect,
      },
      leftJoins: [
        { table: paymentTerms, on: eq(paymentTerms.id, supplierSites.paymentTermId) },
        { table: partyTaxRegistrations, on: eq(partyTaxRegistrations.id, supplierSites.partyTaxRegistrationId) },
        { table: partyBankAccounts, on: eq(partyBankAccounts.id, supplierSites.partyBankAccountId) },
        ...orderContactJoins,
      ],
      where,
      orderBy: [desc(supplierSites.createdAt)],
      limit,
    });
  }

  // Returns every enrollment of a supplier joined with its picks
  async findAllForSupplier(supplierId: string): Promise<SupplierSiteWithPicks[]> {
    const { result } = await this.findWithPicks(eq(supplierSites.supplierId, supplierId));
    return result;
  }

  // Loads one enrollment joined with its picks
  async findByIdWithPicks(id: string): Promise<SupplierSiteWithPicks | undefined> {
    const { result } = await this.findWithPicks(eq(supplierSites.id, id), 1);
    return result[0];
  }

  // Rejects an order email or phone that is not an active ORDERING communication of the supplier's party on that channel
  async assertOrderCommunicationUsable(
    communicationId: string,
    partyId: string,
    channel: PartyCommunicationChannel,
  ): Promise<void> {
    const target = ORDER_COMMUNICATION_FIELDS[channel as keyof typeof ORDER_COMMUNICATION_FIELDS];
    const [row] = await this.db
      .select({
        partyId: partyCommunications.partyId,
        channel: partyCommunications.channel,
        isActive: partyCommunications.isActive,
        isOrdering: sql<boolean>`EXISTS (
          SELECT 1 FROM ${partyFunctions}
          WHERE ${partyFunctions.partyCommunicationId} = ${partyCommunications.id}
            AND ${partyFunctions.function} = ${PartyFunctionTypeValues.ORDERING}
        )`,
      })
      .from(partyCommunications)
      .where(eq(partyCommunications.id, communicationId))
      .limit(1);

    const failure = !row || row.partyId !== partyId
      ? { detail: `The selected ${target.noun} does not belong to this supplier's company.`, message: 'Not a contact of this company' }
      : row.channel !== channel
        ? { detail: `The selected value is not an ${target.noun}.`, message: `Not an ${target.noun}` }
        : !row.isActive
          ? { detail: `The selected ${target.noun} is inactive. Pick an active one.`, message: `Inactive ${target.noun}` }
          : !row.isOrdering
            ? { detail: `The selected ${target.noun} is not marked for ordering on the company.`, message: 'Not marked for ordering' }
            : undefined;
    if (!failure) return;
    throw new BadRequestException({
      label: target.label,
      detail: failure.detail,
      errors: [{ field: target.field, message: failure.message }],
    });
  }

  // Loads a supplier row for enrollment validation
  async findSupplier(supplierId: string): Promise<Supplier | undefined> {
    const [row] = await this.db.select().from(suppliers).where(eq(suppliers.id, supplierId)).limit(1);
    return row as Supplier | undefined;
  }

  // Loads a payment term for pick validation
  async findPaymentTermById(id: string): Promise<PaymentTerm | undefined> {
    const [row] = await this.db.select().from(paymentTerms).where(eq(paymentTerms.id, id)).limit(1);
    return row as PaymentTerm | undefined;
  }

  // Loads a tax registration for pick validation
  async findRegistrationById(id: string): Promise<PartyTaxRegistration | undefined> {
    const [row] = await this.db.select().from(partyTaxRegistrations).where(eq(partyTaxRegistrations.id, id)).limit(1);
    return row as PartyTaxRegistration | undefined;
  }

  async findBySupplierAndSite(supplierId: string, siteId: string): Promise<SupplierSite | undefined> {
    return this.model.findFirst({ where: { supplierId, siteId } }) as Promise<SupplierSite | undefined>;
  }

  // Throws when the supplier is already enrolled for the site
  async assertNotEnrolled(supplierId: string, siteId: string): Promise<void> {
    if (await this.isEnrolled(supplierId, siteId)) {
      throw new ConflictException('Supplier is already enrolled for this site.');
    }
  }

  // Returns true when the supplier is enrolled for the site
  async isEnrolled(supplierId: string, siteId: string): Promise<boolean> {
    return this.exists(and(eq(supplierSites.supplierId, supplierId), eq(supplierSites.siteId, siteId)) as SQL);
  }

  // Loads a bank account for pick validation
  async findBankAccountById(id: string): Promise<PartyBankAccount | undefined> {
    const [row] = await this.db.select().from(partyBankAccounts).where(eq(partyBankAccounts.id, id)).limit(1);
    return row as PartyBankAccount | undefined;
  }

  // Loads a relationship for order-contact pick validation
  async findRelationshipById(id: string): Promise<PartyRelationship | undefined> {
    const [row] = await this.db.select().from(partyRelationships).where(eq(partyRelationships.id, id)).limit(1);
    return row as PartyRelationship | undefined;
  }

  // Loads an enrollment joined with the owning supplier's party for pick validation
  async findByIdWithPartyId(id: string): Promise<(SupplierSite & { partyId: string | null }) | undefined> {
    const [row] = await this.db
      .select({ ...getColumns(supplierSites), partyId: suppliers.partyId })
      .from(supplierSites)
      .innerJoin(suppliers, eq(suppliers.id, supplierSites.supplierId))
      .where(eq(supplierSites.id, id))
      .limit(1);
    return row as (SupplierSite & { partyId: string | null }) | undefined;
  }

  // Every supplier of the legal entity with the site's enrollment when there is one — the site's suppliers list
  async findForSiteList(
    legalEntityId: string,
    siteId: string,
    options: { where?: SQL; orderBy?: SQL[]; limit: number; offset: number },
  ): Promise<{ result: SiteSupplierListRow[]; count: number }> {
    const where = and(eq(suppliers.legalEntityId, legalEntityId), options.where);
    const enrollmentAtSite = and(eq(supplierSites.supplierId, suppliers.id), eq(supplierSites.siteId, siteId));
    const [rows, [total]] = await Promise.all([
      this.db
        .select({
          ...getColumns(suppliers),
          partyName: parties.displayName,
          enrollmentId: supplierSites.id,
          paymentTermId: supplierSites.paymentTermId,
          paymentTermName: paymentTerms.name,
          orderEmailCommunicationId: supplierSites.orderEmailCommunicationId,
          orderPhoneCommunicationId: supplierSites.orderPhoneCommunicationId,
          orderEmail: orderEmail.value,
          orderPhone: orderPhone.value,
          enrolledAt: supplierSites.createdAt,
        })
        .from(suppliers)
        .innerJoin(parties, eq(parties.id, suppliers.partyId))
        .leftJoin(supplierSites, enrollmentAtSite)
        .leftJoin(paymentTerms, eq(paymentTerms.id, supplierSites.paymentTermId))
        .leftJoin(orderEmail, eq(orderEmail.id, supplierSites.orderEmailCommunicationId))
        .leftJoin(orderPhone, eq(orderPhone.id, supplierSites.orderPhoneCommunicationId))
        .where(where)
        .orderBy(
          ...(options.orderBy?.length ? options.orderBy : [sql`${supplierSites.id} IS NULL`, asc(parties.displayName)]),
        )
        .limit(options.limit)
        .offset(options.offset),
      this.db
        .select({ count: sql<number>`count(*)::int`.mapWith(Number) })
        .from(suppliers)
        .innerJoin(parties, eq(parties.id, suppliers.partyId))
        .leftJoin(supplierSites, enrollmentAtSite)
        .leftJoin(paymentTerms, eq(paymentTerms.id, supplierSites.paymentTermId))
        .where(where),
    ]);
    return { result: rows as SiteSupplierListRow[], count: total?.count ?? 0 };
  }

  // Loads a supplier of the legal entity as one site sees it, enrolled or not, throwing when it does not exist
  async findAtSiteOrThrow(legalEntityId: string, siteId: string, supplierId: string): Promise<SupplierAtSiteRow> {
    const [row] = await this.db
      .select({
        ...getColumns(suppliers),
        partyName: parties.displayName,
        enrollmentId: supplierSites.id,
        paymentTermId: supplierSites.paymentTermId,
        paymentTermName: paymentTerms.name,
        partyTaxRegistrationId: supplierSites.partyTaxRegistrationId,
        registrationNumber: partyTaxRegistrations.registrationNumber,
        partyBankAccountId: supplierSites.partyBankAccountId,
        bankAccountName: partyBankAccounts.accountName,
        orderRelationshipId: supplierSites.orderRelationshipId,
        orderEmailCommunicationId: supplierSites.orderEmailCommunicationId,
        orderPhoneCommunicationId: supplierSites.orderPhoneCommunicationId,
        orderEmail: orderEmail.value,
        orderPhone: orderPhone.value,
        enrolledAt: supplierSites.createdAt,
      })
      .from(suppliers)
      .innerJoin(parties, eq(parties.id, suppliers.partyId))
      .leftJoin(supplierSites, and(eq(supplierSites.supplierId, suppliers.id), eq(supplierSites.siteId, siteId)))
      .leftJoin(paymentTerms, eq(paymentTerms.id, supplierSites.paymentTermId))
      .leftJoin(partyTaxRegistrations, eq(partyTaxRegistrations.id, supplierSites.partyTaxRegistrationId))
      .leftJoin(partyBankAccounts, eq(partyBankAccounts.id, supplierSites.partyBankAccountId))
      .leftJoin(orderEmail, eq(orderEmail.id, supplierSites.orderEmailCommunicationId))
      .leftJoin(orderPhone, eq(orderPhone.id, supplierSites.orderPhoneCommunicationId))
      .where(and(eq(suppliers.legalEntityId, legalEntityId), eq(suppliers.id, supplierId)))
      .limit(1);
    if (!row) throw new NotFoundException('Supplier not found.');
    return row as SupplierAtSiteRow;
  }
}
