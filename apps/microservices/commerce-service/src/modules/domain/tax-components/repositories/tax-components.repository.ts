import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, getColumns, ne, type SQL } from '@vritti/api-sdk/drizzle-orm';
import { ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { type FindForSelectConfig, type SelectQueryResult } from '@vritti/api-sdk/select';
import { type TaxComponent, taxComponents, taxGroupRates } from '@/db/schema';

export type TaxComponentDetail = TaxComponent & {
  rateCount: number;
};

@Injectable()
export class TaxComponentsDomainRepository extends PrimaryBaseRepository<typeof taxComponents> {
  constructor(database: PrimaryDatabaseService) {
    super(database, taxComponents);
  }

  // Paginated tax-component options for the selector dropdown
  findForSelect(config: FindForSelectConfig): Promise<SelectQueryResult> {
    return super.findForSelect(config);
  }

  // Loads a tax component with how many tax-group rates use it
  async findDetailOrThrow(id: string): Promise<TaxComponentDetail> {
    const entity = await this.findById<TaxComponentDetail>(id, { select: this.selection() });
    if (!entity) throw new NotFoundException('Tax component not found.');
    return entity;
  }

  // Returns paginated tax components with their rate counts, filtered by an already-built where clause
  findDetailsForTable(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: TaxComponentDetail[]; count: number }> {
    return this.findAllAndCount<TaxComponentDetail>({ select: this.selection(), ...options });
  }

  // Codes are unique per organization and country
  async assertCodeFree(countryCode: string, code: string, excludeId?: string): Promise<void> {
    const taken = await this.exists(
      and(
        eq(taxComponents.countryCode, countryCode),
        eq(taxComponents.code, code),
        excludeId ? ne(taxComponents.id, excludeId) : undefined,
      ) as SQL,
    );
    if (!taken) return;
    throw new ConflictException({
      label: 'Code Already Used',
      detail: `A ${countryCode} tax component with code "${code}" already exists.`,
      errors: [{ field: 'code', message: 'Code already in use' }],
    });
  }

  // Tax-group rates take their component from the group's country, so a component's country is fixed once a rate
  // uses it
  assertCountryChangeable(existing: TaxComponentDetail, countryCode: string): void {
    if (countryCode === existing.countryCode || existing.rateCount === 0) return;
    throw new ConflictException({
      label: 'Tax Component In Use',
      detail: `Tax-group rates in ${existing.countryCode} use "${existing.name}", so its country cannot change.`,
      errors: [{ field: 'countryCode', message: 'Used by tax-group rates' }],
    });
  }

  // System components are reserved, and a component that tax-group rates use cannot be deleted
  assertDeletable(existing: TaxComponentDetail): void {
    if (existing.isSystem) {
      throw new ConflictException({
        label: 'System Tax Component',
        detail: `Cannot delete "${existing.name}" — it is reserved by the system.`,
      });
    }
    if (existing.rateCount > 0) {
      throw new ConflictException({
        label: 'Tax Component In Use',
        detail: `Cannot delete "${existing.name}" — tax-group rates use it. Remove those rates first.`,
      });
    }
  }

  // Selects a tax component with how many tax-group rates use it
  private selection() {
    return {
      ...getColumns(taxComponents),
      rateCount: this.db.$count(taxGroupRates, eq(taxGroupRates.taxComponentId, taxComponents.id)),
    };
  }
}
