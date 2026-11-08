import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, getColumns, gte, isNull, lte, or, type SQL } from '@vritti/api-sdk/drizzle-orm';
import { formatISO } from 'date-fns';
import { type TaxClassGroup, taxClasses, taxClassGroups, taxGroups } from '@/db/schema';

export interface TaxClassMappingRow {
  taxClassId: string;
  taxClassCode: string;
  taxClassName: string;
  mapping: TaxClassGroup | null;
  taxGroup: { code: string; name: string } | null;
}

@Injectable()
export class TaxClassMappingsDomainRepository extends PrimaryBaseRepository<typeof taxClasses> {
  constructor(database: PrimaryDatabaseService) {
    super(database, taxClasses);
  }

  // Returns a page of active tax classes, each with its mapping in the country that is valid today and has no price
  // limit — null when the class is unmapped there. Mappings never overlap, so a class joins at most one
  findMappingsForTable(options: {
    countryCode: string;
    where?: SQL;
    orderBy?: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: TaxClassMappingRow[]; count: number }> {
    const { countryCode, where, ...page } = options;
    const today = formatISO(new Date(), { representation: 'date' });
    return this.findAllAndCount<TaxClassMappingRow>({
      select: {
        taxClassId: taxClasses.id,
        taxClassCode: taxClasses.code,
        taxClassName: taxClasses.name,
        mapping: getColumns(taxClassGroups),
        taxGroup: { code: taxGroups.code, name: taxGroups.name },
      },
      leftJoins: [
        {
          table: taxClassGroups,
          on: and(
            eq(taxClassGroups.taxClassId, taxClasses.id),
            eq(taxClassGroups.countryCode, countryCode),
            isNull(taxClassGroups.maxUnitPrice),
            lte(taxClassGroups.validFrom, today),
            or(isNull(taxClassGroups.validTo), gte(taxClassGroups.validTo, today)),
          ),
        },
        { table: taxGroups, on: eq(taxGroups.id, taxClassGroups.taxGroupId) },
      ],
      where: and(eq(taxClasses.isActive, true), where),
      ...page,
    });
  }
}
