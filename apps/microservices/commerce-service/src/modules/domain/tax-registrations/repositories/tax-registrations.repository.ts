import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, eq, getColumns, isNull, ne, or, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import {
  type TaxJurisdiction,
  TaxJurisdictionLevelValues,
  type TaxRegistration,
  type TaxRegistrationType,
  TaxRegistrationTypeValues,
  taxJurisdictions,
  taxRegistrations,
} from '@/db/schema';

export type TaxRegistrationWithJurisdiction = TaxRegistration & {
  jurisdictionName: string | null;
  jurisdictionCode: string | null;
};

export interface TaxRegistrationPlacement {
  legalEntityId?: string;
  countryCode: string;
  jurisdictionId: string | null;
  registrationNumber: string;
  registrationType: TaxRegistrationType;
}

@Injectable()
export class TaxRegistrationsDomainRepository extends PrimaryBaseRepository<typeof taxRegistrations> {
  constructor(database: PrimaryDatabaseService) {
    super(database, taxRegistrations);
  }

  // No id means the caller's own workspace entity, which the request already carries as a GUC
  async findByLegalEntity(legalEntityId?: string): Promise<TaxRegistrationWithJurisdiction[]> {
    const { result } = await this.findAllAndCount<TaxRegistrationWithJurisdiction>({
      select: this.selection(),
      leftJoins: this.joins(),
      where: this.ofLegalEntity(legalEntityId),
      orderBy: this.defaultOrder(),
      limit: 200,
      offset: 0,
    });
    return result;
  }

  // Every registration in the organization — RLS scopes it, so the aggregate needs no org filter
  async findAllInOrg(): Promise<TaxRegistrationWithJurisdiction[]> {
    const { result } = await this.findAllAndCount<TaxRegistrationWithJurisdiction>({
      select: this.selection(),
      leftJoins: this.joins(),
      orderBy: this.defaultOrder(),
      limit: 500,
      offset: 0,
    });
    return result;
  }

  // Loads a registration with its jurisdiction's name and code, or undefined when out of reach
  async findByIdWithJurisdiction(id: string): Promise<TaxRegistrationWithJurisdiction | undefined> {
    return this.findById<TaxRegistrationWithJurisdiction>(id, { select: this.selection(), leftJoins: this.joins() });
  }

  // Loads a registration, throwing when it is out of reach
  async findByIdOrThrow(id: string): Promise<TaxRegistration> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('Tax registration not found.');
    return entity;
  }

  // Returns paginated registrations with their jurisdiction, filtered by an already-built where clause
  async findForTable(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: TaxRegistrationWithJurisdiction[]; count: number }> {
    return this.findAllAndCount<TaxRegistrationWithJurisdiction>({
      select: this.selection(),
      leftJoins: this.joins(),
      ...options,
    });
  }

  // Clears the primary flag on an entity's other registrations, so at most one stays primary
  async clearPrimary(legalEntityId: string, exceptId?: string): Promise<void> {
    const where = exceptId
      ? and(eq(taxRegistrations.legalEntityId, legalEntityId), ne(taxRegistrations.id, exceptId))
      : eq(taxRegistrations.legalEntityId, legalEntityId);
    await this.db.update(taxRegistrations).set({ isPrimary: false }).where(where);
  }

  // A named jurisdiction must lie in the registration's country, and a GSTIN — issued per state — must name a state.
  // VAT, TIN and other numbers may be national. Returns the jurisdiction so callers can name it
  async findJurisdictionOrThrow(registration: TaxRegistrationPlacement): Promise<TaxJurisdiction | null> {
    const isGstin = registration.registrationType === TaxRegistrationTypeValues.GSTIN;
    if (!registration.jurisdictionId) {
      if (!isGstin) return null;
      throw new BadRequestException({
        label: 'State Required',
        detail: 'A GSTIN is issued per state. Choose the state this GSTIN is registered in.',
        errors: [{ field: 'jurisdictionId', message: 'Choose a state' }],
      });
    }

    const [jurisdiction] = await this.db
      .select()
      .from(taxJurisdictions)
      .where(eq(taxJurisdictions.id, registration.jurisdictionId))
      .limit(1);
    if (!jurisdiction) {
      throw new BadRequestException({
        label: 'Jurisdiction Not Found',
        detail: 'The selected jurisdiction no longer exists. Pick another one.',
        errors: [{ field: 'jurisdictionId', message: 'Jurisdiction not found' }],
      });
    }
    if (jurisdiction.countryCode !== registration.countryCode) {
      throw new BadRequestException({
        label: 'Jurisdiction In Another Country',
        detail: `${jurisdiction.name} is in ${jurisdiction.countryCode}, not ${registration.countryCode}. Pick a jurisdiction in ${registration.countryCode}.`,
        errors: [{ field: 'jurisdictionId', message: `Not in ${registration.countryCode}` }],
      });
    }
    if (isGstin && jurisdiction.level !== TaxJurisdictionLevelValues.STATE) {
      throw new BadRequestException({
        label: 'State Required',
        detail: `A GSTIN is issued per state, and ${jurisdiction.name} is a ${jurisdiction.level.toLowerCase()}. Choose its state.`,
        errors: [{ field: 'jurisdictionId', message: 'Choose a state' }],
      });
    }
    return jurisdiction;
  }

  // Reports which unique keys a registration would collide on, in one pass: a legal entity holds one registration per
  // country and jurisdiction, and a number is recorded once per organization
  async findConflicts(
    registration: TaxRegistrationPlacement,
    excludeId?: string,
  ): Promise<{ placeTaken: boolean; numberTaken: boolean }> {
    const placeMatch = and(
      this.ofLegalEntity(registration.legalEntityId),
      eq(taxRegistrations.countryCode, registration.countryCode),
      registration.jurisdictionId
        ? eq(taxRegistrations.jurisdictionId, registration.jurisdictionId)
        : isNull(taxRegistrations.jurisdictionId),
    );
    const numberMatch = eq(taxRegistrations.registrationNumber, registration.registrationNumber);

    const [row] = await this.db
      .select({
        placeTaken: sql<boolean>`coalesce(bool_or(${placeMatch}), false)`,
        numberTaken: sql<boolean>`coalesce(bool_or(${numberMatch}), false)`,
      })
      .from(taxRegistrations)
      .where(and(or(placeMatch, numberMatch), excludeId ? ne(taxRegistrations.id, excludeId) : undefined));

    return row ?? { placeTaken: false, numberTaken: false };
  }

  // Rejects a registration that would collide with another one of the entity's or the organization's
  async assertNoConflicts(
    registration: TaxRegistrationPlacement,
    jurisdiction: TaxJurisdiction | null,
    excludeId?: string,
  ): Promise<void> {
    const { placeTaken, numberTaken } = await this.findConflicts(registration, excludeId);
    if (placeTaken) {
      throw new ConflictException({
        label: 'Already Registered There',
        detail: jurisdiction
          ? `This legal entity already has a registration in ${jurisdiction.name}. Edit that registration instead.`
          : `This legal entity already has a national registration in ${registration.countryCode}. Edit that registration instead.`,
        errors: [{ field: jurisdiction ? 'jurisdictionId' : 'countryCode', message: 'Already registered here' }],
      });
    }
    if (numberTaken) {
      throw new ConflictException({
        label: 'Already Registered',
        detail: `"${registration.registrationNumber}" is already recorded against a legal entity in this organization.`,
        errors: [{ field: 'registrationNumber', message: 'Already in use' }],
      });
    }
  }

  // Selects a registration with its jurisdiction's name and code — both null for a national registration
  private selection() {
    return {
      ...getColumns(taxRegistrations),
      jurisdictionName: taxJurisdictions.name,
      jurisdictionCode: taxJurisdictions.code,
    };
  }

  // Joins the jurisdiction, which a national registration does not name
  private joins() {
    return [{ table: taxJurisdictions, on: eq(taxJurisdictions.id, taxRegistrations.jurisdictionId) }];
  }

  // Orders registrations by country, then jurisdiction name, with the national registration last
  private defaultOrder(): SQL[] {
    return [asc(taxRegistrations.countryCode), asc(taxJurisdictions.name)];
  }

  // Matches the given legal entity's registrations, or the workspace entity's when no id is given
  private ofLegalEntity(legalEntityId?: string): SQL {
    return legalEntityId
      ? eq(taxRegistrations.legalEntityId, legalEntityId)
      : sql`${taxRegistrations.legalEntityId} = cast(current_setting('app.le_id') as uuid)`;
  }
}
