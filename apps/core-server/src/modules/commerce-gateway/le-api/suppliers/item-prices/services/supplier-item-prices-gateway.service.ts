import type { AddSupplierItemPriceDto } from '@commerce/supplier-item-prices/dto/request/add-supplier-item-price.dto';
import type { SupplierItemPriceHistoryQueryDto } from '@commerce/supplier-item-prices/dto/request/supplier-item-price-history-query.dto';
import type { UpdateSupplierItemPriceDto } from '@commerce/supplier-item-prices/dto/request/update-supplier-item-price.dto';
import type { SupplierItemPriceHistoryResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-price-history-response.dto';
import type { SupplierItemPriceResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-price-response.dto';
import type { SupplierItemPriceTableResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-price-table-response.dto';
import type { SupplierItemPricedSitesResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-priced-sites-response.dto';
import { SiteDomainRepository } from '@domain/site/repositories/site.repository';
import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import { NatsClientService } from '@vritti/api-sdk/nats';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/select';
import { OwnerNameService } from '@/owner-names/owner-name.service';

@Injectable()
export class SupplierItemPricesGatewayService {
  private readonly logger = new Logger(SupplierItemPricesGatewayService.name);

  constructor(
    private readonly nats: NatsClientService,
    private readonly dataTableStateService: DataTableStateService,
    private readonly ownerNames: OwnerNameService,
    private readonly siteRepository: SiteDomainRepository,
  ) {}

  // A supplier item's price timeline at the site in the table's context
  async findItemPricesTable(supplierItemId: string, userId: string): Promise<SupplierItemPriceTableResponseDto> {
    this.logger.log(`le.suppliers.siteItems.prices.table — supplierItemId: ${supplierItemId}`);
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `commerce-le-supplier-item-${supplierItemId}-prices`,
    );
    const { result, count } = await this.nats.send<{ result: SupplierItemPriceResponseDto[]; count: number }>(
      'commerce',
      'le.suppliers.siteItems.prices.table',
      { supplierItemId, ...state },
    );
    return { result, count, state, activeViewId };
  }

  // The sites a supplier item has prices at, in the site picker's order
  async findItemPricedSiteIds(
    supplierItemId: string,
    legalEntityId: string | undefined,
  ): Promise<SupplierItemPricedSitesResponseDto> {
    this.logger.log(`le.suppliers.siteItems.prices.siteIds — supplierItemId: ${supplierItemId}`);
    if (!legalEntityId) return { siteIds: [] };
    const siteIds = await this.nats.send<string[]>('commerce', 'le.suppliers.siteItems.prices.siteIds', {
      supplierItemId,
    });
    if (siteIds.length === 0) return { siteIds };
    const query = Object.assign(new SelectOptionsQueryDto(), { limit: siteIds.length });
    const { options } = await this.siteRepository.findForSelectOptions(legalEntityId, query, siteIds);
    return { siteIds: options.map((option) => String(option.value)) };
  }

  // A supplier item's price windows in a date range, with site names, at the asked sites — or at every site it is
  // priced at when none are asked for
  async findItemPriceHistory(
    supplierItemId: string,
    query: SupplierItemPriceHistoryQueryDto,
    legalEntityId: string | undefined,
    orgId: string,
  ): Promise<SupplierItemPriceHistoryResponseDto> {
    this.logger.log(`le.suppliers.siteItems.prices.priceHistory — supplierItemId: ${supplierItemId}`);
    const siteIds = query.sites?.length
      ? query.sites
      : (await this.findItemPricedSiteIds(supplierItemId, legalEntityId)).siteIds;
    if (siteIds.length === 0) return { sites: [] };

    const { sites } = await this.nats.send<SupplierItemPriceHistoryResponseDto>(
      'commerce',
      'le.suppliers.siteItems.prices.priceHistory',
      { supplierItemId, siteIds, from: query.from, to: query.to },
    );
    return { sites: await this.ownerNames.withSiteNames(orgId, sites) };
  }

  // Adds a price record to a supplier item's timeline
  async addItemPrice(
    supplierItemId: string,
    dto: AddSupplierItemPriceDto,
  ): Promise<CreateResponseDto<SupplierItemPriceResponseDto[]>> {
    this.logger.log(
      `le.suppliers.siteItems.prices.create — supplierItemId: ${supplierItemId}, validFrom: ${dto.validFrom}`,
    );
    return this.nats.send('commerce', 'le.suppliers.siteItems.prices.create', { supplierItemId, ...dto });
  }

  // Updates a supplier item price record
  async updateItemPrice(priceId: string, dto: UpdateSupplierItemPriceDto): Promise<SuccessResponseDto> {
    this.logger.log(`le.suppliers.siteItems.prices.update — id: ${priceId}`);
    return this.nats.send('commerce', 'le.suppliers.siteItems.prices.update', { id: priceId, ...dto });
  }

  // Deletes a supplier item price record
  async deleteItemPrice(priceId: string): Promise<SuccessResponseDto> {
    this.logger.log(`le.suppliers.siteItems.prices.delete — id: ${priceId}`);
    return this.nats.send('commerce', 'le.suppliers.siteItems.prices.delete', { id: priceId });
  }
}
