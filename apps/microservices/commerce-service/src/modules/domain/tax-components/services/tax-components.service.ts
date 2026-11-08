import { Injectable, Logger } from '@nestjs/common';
import { type FieldMap, FilterProcessor, type TableViewState } from '@vritti/api-sdk/data-table';
import { and, desc } from '@vritti/api-sdk/drizzle-orm';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { type SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk/select';
import { taxComponents } from '@/db/schema';
import { TaxComponentDto } from '../dto/entity/tax-component.dto';
import type { CreateTaxComponentDto } from '../dto/request/create-tax-component.dto';
import type { UpdateTaxComponentDto } from '../dto/request/update-tax-component.dto';
import { TaxComponentsDomainRepository } from '../repositories/tax-components.repository';

@Injectable()
export class TaxComponentsDomainService {
  private readonly logger = new Logger(TaxComponentsDomainService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: taxComponents.name, type: 'string' },
    code: { column: taxComponents.code, type: 'string' },
    countryCode: { column: taxComponents.countryCode, type: 'string' },
    country: { column: taxComponents.countryCode, type: 'string' },
    authorityLevel: { column: taxComponents.authorityLevel, type: 'string' },
    isRecoverable: { column: taxComponents.isRecoverable, type: 'boolean' },
    isWithholding: { column: taxComponents.isWithholding, type: 'boolean' },
    isActive: { column: taxComponents.isActive, type: 'boolean' },
    isSystem: { column: taxComponents.isSystem, type: 'boolean' },
  };

  // Search runs ILIKE, which Postgres enums (authority level) and booleans don't support — so it only covers the
  // text columns
  private static readonly SEARCH_FIELD_MAP: FieldMap = {
    name: TaxComponentsDomainService.FIELD_MAP.name,
    code: TaxComponentsDomainService.FIELD_MAP.code,
  };

  constructor(private readonly repository: TaxComponentsDomainRepository) {}

  // Returns paginated, filtered, and sorted tax components, narrowed to the context's country when one is picked
  async findForTable(state: TableViewState): Promise<{ result: TaxComponentDto[]; count: number }> {
    const fieldMap = TaxComponentsDomainService.FIELD_MAP;
    const { limit = 20, offset = 0 } = state.pagination;
    const orderBy = FilterProcessor.buildOrderBy(state.sort, fieldMap);
    const { result, count } = await this.repository.findDetailsForTable({
      where: and(
        FilterProcessor.buildWhere(state.filters, fieldMap),
        FilterProcessor.buildSearch(state.search, TaxComponentsDomainService.SEARCH_FIELD_MAP),
      ),
      orderBy: orderBy.length > 0 ? orderBy : [desc(taxComponents.createdAt)],
      limit,
      offset,
    });
    return { result: result.map(TaxComponentDto.from), count };
  }

  // Returns paginated tax-component options for select dropdowns, only one country's when `country` is given
  findForSelect(query: SelectOptionsQueryDto, options?: { country?: string }): Promise<SelectQueryResult> {
    return this.repository.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey || 'code',
      additionalKeys: query.additionalKeys,
      groupIdKey: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderByKey: query.orderByKey || 'name',
      orderDirection: query.orderDirection || 'asc',
      where: options?.country ? { countryCode: options.country } : undefined,
    });
  }

  // Creates a tax component for one country; its code is unique within that country
  async create(data: CreateTaxComponentDto): Promise<CreateResponseDto<TaxComponentDto>> {
    await this.repository.assertCodeFree(data.countryCode, data.code);
    const entity = await this.repository.create({
      countryCode: data.countryCode,
      code: data.code,
      name: data.name,
      authorityLevel: data.authorityLevel,
      isRecoverable: data.isRecoverable,
      isWithholding: data.isWithholding,
      isActive: data.isActive,
      isSystem: false,
    });

    this.logger.log(`Created tax component: ${entity.countryCode} ${entity.code}`);
    return {
      success: true,
      message: `Tax component "${entity.name}" created successfully.`,
      data: TaxComponentDto.from({ ...entity, rateCount: 0 }),
    };
  }

  // Returns a single tax component by ID
  async findById(id: string): Promise<TaxComponentDto> {
    return TaxComponentDto.from(await this.repository.findDetailOrThrow(id));
  }

  // Updates a tax component's editable fields; its country is fixed once a tax-group rate uses it
  async update(id: string, data: Omit<UpdateTaxComponentDto, 'id'>): Promise<SuccessResponseDto> {
    const existing = await this.repository.findDetailOrThrow(id);
    const countryCode = data.countryCode ?? existing.countryCode;
    this.repository.assertCountryChangeable(existing, countryCode);
    if (countryCode !== existing.countryCode) await this.repository.assertCodeFree(countryCode, existing.code, id);

    await this.repository.update(id, data);

    this.logger.log(`Updated tax component: ${existing.countryCode} ${existing.code} (${id})`);
    return { success: true, message: `Tax component "${data.name ?? existing.name}" updated successfully.` };
  }

  // Deletes a tax component unless it is reserved by the system or a tax-group rate uses it
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.repository.findDetailOrThrow(id);
    this.repository.assertDeletable(existing);
    await this.repository.delete(id);
    this.logger.log(`Deleted tax component: ${existing.countryCode} ${existing.code} (${id})`);
    return { success: true, message: `Tax component "${existing.name}" deleted successfully.` };
  }
}
