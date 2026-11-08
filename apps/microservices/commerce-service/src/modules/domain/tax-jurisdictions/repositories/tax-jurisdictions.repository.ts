import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { eq, exists, getColumns, or, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { alias } from '@vritti/api-sdk/drizzle-pg-core';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { type FindForSelectConfig, type SelectQueryResult } from '@vritti/api-sdk/select';
import {
  parties,
  partyTaxRegistrations,
  type TaxJurisdiction,
  type TaxJurisdictionLevel,
  TaxJurisdictionLevelValues,
  taxGroupRates,
  taxJurisdictions,
  taxRegistrations,
} from '@/db/schema';

export type TaxJurisdictionDetail = TaxJurisdiction & {
  parentName: string | null;
  hasChildren: boolean;
  isReferenced: boolean;
};

export interface TaxJurisdictionHierarchyRow {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  level: TaxJurisdictionLevel;
  countryCode: string;
  depth: number;
}

export interface TaxJurisdictionPlacement {
  level: TaxJurisdictionLevel;
  countryCode: string;
  parentId: string | null;
}

const PARENT_LEVELS: Record<TaxJurisdictionLevel, readonly TaxJurisdictionLevel[]> = {
  STATE: [],
  COUNTY: [TaxJurisdictionLevelValues.STATE],
  CITY: [TaxJurisdictionLevelValues.COUNTY, TaxJurisdictionLevelValues.STATE],
  DISTRICT: [TaxJurisdictionLevelValues.STATE, TaxJurisdictionLevelValues.COUNTY, TaxJurisdictionLevelValues.CITY],
};

const parent = alias(taxJurisdictions, 'parent');
const child = alias(taxJurisdictions, 'child');
const levelList = new Intl.ListFormat('en', { type: 'disjunction' });

@Injectable()
export class TaxJurisdictionsDomainRepository extends PrimaryBaseRepository<typeof taxJurisdictions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, taxJurisdictions);
  }

  // Returns paginated tax-jurisdiction options for the selector dropdown
  findForSelect(config: FindForSelectConfig): Promise<SelectQueryResult> {
    return super.findForSelect(config);
  }

  // Loads a jurisdiction with its parent's name and whether children, registrations, parties or tax rates depend on it
  async findDetailOrThrow(id: string): Promise<TaxJurisdictionDetail> {
    const entity = await this.findById<TaxJurisdictionDetail>(id, {
      select: this.selection(),
      leftJoins: [this.parentJoin()],
    });
    if (!entity) throw new NotFoundException('Tax jurisdiction not found.');
    return entity;
  }

  // Returns paginated jurisdictions with their parent name and usage, filtered by an already-built where clause
  findDetailsForTable(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: TaxJurisdictionDetail[]; count: number }> {
    return this.findAllAndCount<TaxJurisdictionDetail>({
      select: this.selection(),
      leftJoins: [this.parentJoin()],
      ...options,
    });
  }

  // Codes are unique per organization
  async assertCodeFree(code: string): Promise<void> {
    if (!(await this.exists(eq(taxJurisdictions.code, code)))) return;
    throw new ConflictException({
      label: 'Code Already Used',
      detail: `A tax jurisdiction with code "${code}" already exists.`,
      errors: [{ field: 'code', message: 'Code already in use' }],
    });
  }

  // A state sits at the top; every other level hangs under a jurisdiction of the same country one level up. Returns the
  // parent so callers can name it
  async findParentOrThrow(placement: TaxJurisdictionPlacement): Promise<TaxJurisdiction | null> {
    const allowed = PARENT_LEVELS[placement.level];
    const level = placement.level.toLowerCase();
    const allowedList = levelList.format(allowed.map((value) => value.toLowerCase()));

    if (allowed.length === 0) {
      if (!placement.parentId) return null;
      throw new BadRequestException({
        label: 'State Has No Parent',
        detail: 'A state is a top-level jurisdiction. Clear the parent, or pick a lower level.',
        errors: [{ field: 'parentId', message: 'Leave empty for a state' }],
      });
    }
    if (!placement.parentId) {
      throw new BadRequestException({
        label: 'Parent Required',
        detail: `A ${level} sits under a ${allowedList}. Choose its parent.`,
        errors: [{ field: 'parentId', message: 'Parent is required' }],
      });
    }

    const entity = await this.findById(placement.parentId);
    if (!entity) {
      throw new BadRequestException({
        label: 'Parent Not Found',
        detail: 'The selected parent jurisdiction no longer exists. Pick another one.',
        errors: [{ field: 'parentId', message: 'Parent not found' }],
      });
    }
    if (entity.countryCode !== placement.countryCode) {
      throw new BadRequestException({
        label: 'Parent In Another Country',
        detail: `${entity.name} is in ${entity.countryCode}, not ${placement.countryCode}. Pick a parent in ${placement.countryCode}.`,
        errors: [{ field: 'parentId', message: `Not in ${placement.countryCode}` }],
      });
    }
    if (!allowed.includes(entity.level)) {
      throw new BadRequestException({
        label: 'Wrong Parent Level',
        detail: `A ${level} sits under a ${allowedList}, and ${entity.name} is a ${entity.level.toLowerCase()}.`,
        errors: [{ field: 'parentId', message: `Pick a ${allowedList}` }],
      });
    }
    return entity;
  }

  // Children and the registrations, parties and tax-group rates that name a jurisdiction rely on its level and
  // country, so both are fixed once anything depends on it
  assertPlacementChangeable(existing: TaxJurisdictionDetail, next: TaxJurisdictionPlacement): void {
    if (next.level === existing.level && next.countryCode === existing.countryCode) return;
    if (existing.hasChildren) {
      throw new ConflictException({
        label: 'Jurisdiction Has Children',
        detail: `${existing.name} has child jurisdictions, so its level and country cannot change. Move or delete them first.`,
      });
    }
    if (existing.isReferenced) {
      throw new ConflictException({
        label: 'Jurisdiction In Use',
        detail: `Tax registrations, companies or tax-group rates name ${existing.name}, so its level and country cannot change.`,
      });
    }
  }

  // A jurisdiction with children, or one that registrations, companies or tax-group rates name, cannot be deleted
  assertDeletable(existing: TaxJurisdictionDetail): void {
    if (existing.hasChildren) {
      throw new ConflictException({
        label: 'Jurisdiction Has Children',
        detail: `Cannot delete ${existing.name} — it still has child jurisdictions. Remove those first.`,
      });
    }
    if (existing.isReferenced) {
      throw new ConflictException({
        label: 'Jurisdiction In Use',
        detail: `Cannot delete ${existing.name} — tax registrations, companies or tax-group rates name it. Move them to another jurisdiction first.`,
      });
    }
  }

  // Returns total tax-jurisdiction count
  async countAll(): Promise<number> {
    const [result] = await this.db.select({ count: sql<number>`count(*)` }).from(taxJurisdictions);
    return Number(result?.count ?? 0);
  }

  // Returns hierarchy rows in tree order using a recursive CTE: top-level rows grouped by country, children by name
  async findHierarchyRows(search?: string, country?: string): Promise<TaxJurisdictionHierarchyRow[]> {
    if (!search) {
      const rootInCountry = country ? sql`AND root.country_code = ${country}` : sql``;
      const result = await this.db.execute(sql`
        WITH RECURSIVE tree AS (
          SELECT
            root.id::text AS id,
            root.parent_id::text AS parent_id,
            root.name::text AS name,
            root.code::text AS code,
            root.level::text AS level,
            root.country_code::text AS country_code,
            0::int AS depth,
            ARRAY[root.id::text] AS path,
            root.country_code || ':' || lower(root.name) || ':' || root.id::text AS ord
          FROM ${taxJurisdictions} AS root
          WHERE root.parent_id IS NULL ${rootInCountry}

          UNION ALL

          SELECT
            child.id::text AS id,
            child.parent_id::text AS parent_id,
            child.name::text AS name,
            child.code::text AS code,
            child.level::text AS level,
            child.country_code::text AS country_code,
            tree.depth + 1 AS depth,
            tree.path || child.id::text AS path,
            tree.ord || '.' || lower(child.name) || ':' || child.id::text AS ord
          FROM ${taxJurisdictions} AS child
          JOIN tree ON child.parent_id::text = tree.id
          WHERE NOT (child.id::text = ANY(tree.path))
        )
        SELECT id, parent_id, name, code, level, country_code, depth
        FROM tree
        ORDER BY ord
      `);

      return this.mapHierarchyRows(result);
    }

    const searchPattern = `%${search}%`;
    const matchInCountry = country ? sql`AND j.country_code = ${country}` : sql``;
    const result = await this.db.execute(sql`
      WITH RECURSIVE matched AS (
        SELECT
          j.id::text AS id,
          j.parent_id::text AS parent_id
        FROM ${taxJurisdictions} AS j
        WHERE j.name ILIKE ${searchPattern} ${matchInCountry}
      ),
      ancestors AS (
        SELECT id, parent_id
        FROM matched

        UNION ALL

        SELECT
          p.id::text AS id,
          p.parent_id::text AS parent_id
        FROM ${taxJurisdictions} AS p
        JOIN ancestors AS a ON a.parent_id = p.id::text
      ),
      relevant AS (
        SELECT DISTINCT id
        FROM ancestors
      ),
      roots AS (
        SELECT
          j.id::text AS id,
          j.parent_id::text AS parent_id,
          j.name::text AS name,
          j.code::text AS code,
          j.level::text AS level,
          j.country_code::text AS country_code
        FROM ${taxJurisdictions} AS j
        JOIN relevant r ON r.id = j.id::text
        WHERE j.parent_id IS NULL
           OR j.parent_id::text NOT IN (SELECT id FROM relevant)
      ),
      tree AS (
        SELECT
          roots.id,
          roots.parent_id,
          roots.name,
          roots.code,
          roots.level,
          roots.country_code,
          0::int AS depth,
          ARRAY[roots.id] AS path,
          roots.country_code || ':' || lower(roots.name) || ':' || roots.id AS ord
        FROM roots

        UNION ALL

        SELECT
          child.id::text AS id,
          child.parent_id::text AS parent_id,
          child.name::text AS name,
          child.code::text AS code,
          child.level::text AS level,
          child.country_code::text AS country_code,
          tree.depth + 1 AS depth,
          tree.path || child.id::text AS path,
          tree.ord || '.' || lower(child.name) || ':' || child.id::text AS ord
        FROM ${taxJurisdictions} AS child
        JOIN tree ON child.parent_id::text = tree.id
        JOIN relevant ON relevant.id = child.id::text
        WHERE NOT (child.id::text = ANY(tree.path))
      )
      SELECT id, parent_id, name, code, level, country_code, depth
      FROM tree
      ORDER BY ord
    `);

    return this.mapHierarchyRows(result);
  }

  // Selects a jurisdiction with its parent's name and whether children, registrations, parties or tax rates depend on it
  private selection() {
    const one = { one: sql`1` };
    return {
      ...getColumns(taxJurisdictions),
      parentName: parent.name,
      hasChildren: sql<boolean>`${exists(this.db.select(one).from(child).where(eq(child.parentId, taxJurisdictions.id)))}`,
      isReferenced: sql<boolean>`${or(
        exists(
          this.db.select(one).from(taxRegistrations).where(eq(taxRegistrations.jurisdictionId, taxJurisdictions.id)),
        ),
        exists(
          this.db
            .select(one)
            .from(partyTaxRegistrations)
            .where(eq(partyTaxRegistrations.jurisdictionId, taxJurisdictions.id)),
        ),
        exists(this.db.select(one).from(parties).where(eq(parties.jurisdictionId, taxJurisdictions.id))),
        exists(this.db.select(one).from(taxGroupRates).where(eq(taxGroupRates.jurisdictionId, taxJurisdictions.id))),
      )}`,
    };
  }

  // Joins a jurisdiction to its parent for the parent's name
  private parentJoin() {
    return { table: parent, on: eq(parent.id, taxJurisdictions.parentId) };
  }

  // Normalizes raw recursive-CTE rows into typed hierarchy rows
  private mapHierarchyRows(result: unknown): TaxJurisdictionHierarchyRow[] {
    const rows =
      (
        result as {
          rows?: Array<{
            id: string;
            parent_id: string | null;
            name: string;
            code: string;
            level: TaxJurisdictionLevel;
            country_code: string;
            depth: number;
          }>;
        }
      ).rows ?? [];
    return rows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      name: row.name,
      code: row.code,
      level: row.level,
      countryCode: row.country_code,
      depth: Number(row.depth),
    }));
  }
}
