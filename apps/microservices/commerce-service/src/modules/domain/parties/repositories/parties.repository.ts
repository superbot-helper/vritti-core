import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, desc, eq, getColumns, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { alias } from '@vritti/api-sdk/drizzle-pg-core';
import { BadRequestException } from '@vritti/api-sdk/exceptions';
import { type FindForSelectConfig, type SelectQueryResult } from '@vritti/api-sdk/select';
import {
  type Party,
  type PartyAddress,
  PartyCommunicationChannelValues,
  PartyFunctionTypeValues,
  parties,
  partyAddresses,
  partyCommunications,
  partyFunctions,
  partyRelationships,
  partySocialProfiles,
  SocialPlatformValues,
  suppliers,
  type TaxJurisdiction,
  TaxJurisdictionLevelValues,
  TaxRegistrationTypeValues,
  taxJurisdictions,
} from '@/db/schema';
import type { PartyRegistrationPlacement } from './party-tax-registrations.repository';

// Aliased primary-communication joins so a party's EMAIL and PHONE main lines can be projected side by side
export const emailComm = alias(partyCommunications, 'email_comm');
export const phoneComm = alias(partyCommunications, 'phone_comm');
const websiteProfile = alias(partySocialProfiles, 'website_profile');

const emailPrimaryJoin = and(
  eq(emailComm.partyId, parties.id),
  eq(emailComm.channel, PartyCommunicationChannelValues.EMAIL),
  eq(emailComm.isPrimary, true),
);

const phonePrimaryJoin = and(
  eq(phoneComm.partyId, parties.id),
  eq(phoneComm.channel, PartyCommunicationChannelValues.PHONE),
  eq(phoneComm.isPrimary, true),
);

const websiteJoin = and(
  eq(websiteProfile.partyId, parties.id),
  eq(websiteProfile.platform, SocialPlatformValues.WEBSITE),
);

export interface PartyTableRow extends Party {
  email: string | null;
  phone: string | null;
}

@Injectable()
export class PartiesDomainRepository extends PrimaryBaseRepository<typeof parties> {
  constructor(database: PrimaryDatabaseService) {
    super(database, parties);
  }

  // Paginated party options for the selector dropdown
  findForSelect(config: FindForSelectConfig): Promise<SelectQueryResult> {
    return super.findForSelect(config);
  }

  // Whether any supplier references this party (the only FK that restricts party deletion; party_* children cascade).
  async isReferencedBySupplier(partyId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.partyId, partyId))
      .limit(1);
    return !!row;
  }

  // Whether this party is a contact of any company (child in a party relationship).
  async isLinkedToCompany(partyId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: partyRelationships.id })
      .from(partyRelationships)
      .where(eq(partyRelationships.childPartyId, partyId))
      .limit(1);
    return !!row;
  }

  // Single-query party detail: the party joined to its primary REGISTERED address plus its EMAIL/PHONE main lines and a
  // supplier-reference flag for canDelete — one round-trip instead of several.
  async findByIdWithDetails(id: string): Promise<
    | {
        party: Party;
        primaryAddress: PartyAddress | null;
        email: string | null;
        phone: string | null;
        website: string | null;
        referencedBySupplier: boolean;
        linkedToCompanies: boolean;
      }
    | undefined
  > {
    const primaryAddressSelectQuery = this.db
      .select({
        id: partyAddresses.id,
        organizationId: partyAddresses.organizationId,
        partyId: partyAddresses.partyId,
        line1: partyAddresses.line1,
        line2: partyAddresses.line2,
        city: partyAddresses.city,
        region: partyAddresses.region,
        postalCode: partyAddresses.postalCode,
        countryCode: partyAddresses.countryCode,
        isActive: partyAddresses.isActive,
        createdAt: partyAddresses.createdAt,
        updatedAt: partyAddresses.updatedAt,
      })
      .from(partyAddresses)
      .innerJoin(
        partyFunctions,
        and(
          eq(partyFunctions.partyAddressId, partyAddresses.id),
          eq(partyFunctions.function, PartyFunctionTypeValues.REGISTERED),
          eq(partyFunctions.isPrimary, true),
        ),
      )
      .where(eq(partyAddresses.partyId, parties.id))
      .orderBy(desc(partyAddresses.createdAt))
      .limit(1)
      .as('primary_address');

    const [row] = await this.db
      .select({
        party: parties,
        address: {
          id: primaryAddressSelectQuery.id,
          organizationId: primaryAddressSelectQuery.organizationId,
          partyId: primaryAddressSelectQuery.partyId,
          line1: primaryAddressSelectQuery.line1,
          line2: primaryAddressSelectQuery.line2,
          city: primaryAddressSelectQuery.city,
          region: primaryAddressSelectQuery.region,
          postalCode: primaryAddressSelectQuery.postalCode,
          countryCode: primaryAddressSelectQuery.countryCode,
          isActive: primaryAddressSelectQuery.isActive,
          createdAt: primaryAddressSelectQuery.createdAt,
          updatedAt: primaryAddressSelectQuery.updatedAt,
        },
        email: emailComm.value,
        phone: phoneComm.value,
        website: websiteProfile.url,
        referencedBySupplier: sql<boolean>`exists (select 1 from ${suppliers} where ${suppliers.partyId} = ${parties}.id)`,
        linkedToCompanies: sql<boolean>`exists (select 1 from ${partyRelationships} where ${partyRelationships.childPartyId} = ${parties}.id)`,
      })
      .from(parties)
      .leftJoinLateral(primaryAddressSelectQuery, sql`true`)
      .leftJoin(emailComm, emailPrimaryJoin)
      .leftJoin(phoneComm, phonePrimaryJoin)
      .leftJoin(websiteProfile, websiteJoin)
      .where(eq(parties.id, id))
      .limit(1);

    if (!row) return undefined;
    return {
      party: row.party,
      primaryAddress: (row.address as PartyAddress | null) ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      website: row.website ?? null,
      referencedBySupplier: row.referencedBySupplier,
      linkedToCompanies: row.linkedToCompanies,
    };
  }

  // Returns paginated parties with their EMAIL/PHONE main lines, filtered by an already-built where clause
  findForTable(options: {
    where?: SQL;
    orderBy: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: PartyTableRow[]; count: number }> {
    return this.findAllAndCount<PartyTableRow>({
      select: { ...getColumns(parties), email: emailComm.value, phone: phoneComm.value },
      leftJoins: [
        { table: emailComm, on: emailPrimaryJoin },
        { table: phoneComm, on: phonePrimaryJoin },
      ],
      ...options,
    });
  }

  // A party or registration that names a jurisdiction must lie in that jurisdiction's country. Returns the jurisdiction
  // so callers can name it
  async findJurisdictionInCountryOrThrow(
    jurisdictionId: string | null | undefined,
    countryCode: string | null,
  ): Promise<TaxJurisdiction | null> {
    if (!jurisdictionId) return null;
    const [jurisdiction] = await this.db
      .select()
      .from(taxJurisdictions)
      .where(eq(taxJurisdictions.id, jurisdictionId))
      .limit(1);
    if (!jurisdiction) {
      throw new BadRequestException({
        label: 'Jurisdiction Not Found',
        detail: 'The selected jurisdiction no longer exists. Pick another one.',
        errors: [{ field: 'jurisdictionId', message: 'Jurisdiction not found' }],
      });
    }
    if (jurisdiction.countryCode !== countryCode) {
      throw new BadRequestException({
        label: 'Jurisdiction In Another Country',
        detail: countryCode
          ? `${jurisdiction.name} is in ${jurisdiction.countryCode}, not ${countryCode}. Pick a jurisdiction in ${countryCode}.`
          : `${jurisdiction.name} is in ${jurisdiction.countryCode}. Set the country to ${jurisdiction.countryCode}, or clear the jurisdiction.`,
        errors: [{ field: 'jurisdictionId', message: countryCode ? `Not in ${countryCode}` : 'Country not set' }],
      });
    }
    return jurisdiction;
  }

  // A GSTIN is issued per state, so it must name a state of its country; VAT, TIN and other numbers may be national
  async findRegistrationJurisdictionOrThrow(registration: PartyRegistrationPlacement): Promise<TaxJurisdiction | null> {
    const isGstin = registration.registrationType === TaxRegistrationTypeValues.GSTIN;
    if (isGstin && !registration.jurisdictionId) {
      throw new BadRequestException({
        label: 'State Required',
        detail: 'A GSTIN is issued per state. Choose the state this GSTIN is registered in.',
        errors: [{ field: 'jurisdictionId', message: 'Choose a state' }],
      });
    }
    const jurisdiction = await this.findJurisdictionInCountryOrThrow(
      registration.jurisdictionId,
      registration.countryCode,
    );
    if (isGstin && jurisdiction && jurisdiction.level !== TaxJurisdictionLevelValues.STATE) {
      throw new BadRequestException({
        label: 'State Required',
        detail: `A GSTIN is issued per state, and ${jurisdiction.name} is a ${jurisdiction.level.toLowerCase()}. Choose its state.`,
        errors: [{ field: 'jurisdictionId', message: 'Choose a state' }],
      });
    }
    return jurisdiction;
  }
}
