import type { InventoryItemPriceOptionsQueryDto } from '@commerce/inventory-items/dto/request/inventory-item-price-options-query.dto';
import type { InventoryItemPricesTableQueryDto } from '@commerce/inventory-items/dto/request/inventory-item-prices-table-query.dto';
import type {
  InventoryItemPriceGraphResponseDto,
  InventoryItemPriceHistoryResponseDto,
} from '@commerce/inventory-items/dto/response/inventory-item-price-history-response.dto';
import type { InventoryItemPricedSitesResponseDto } from '@commerce/inventory-items/dto/response/inventory-item-priced-sites-response.dto';
import type {
  ItemSupplierPriceComparisonResponseDto,
  ItemSupplierPriceComparisonTableResponseDto,
} from '@commerce/inventory-items/dto/response/item-supplier-price-comparison-response.dto';
import { readPriceGraphSelection } from '@commerce/inventory-items/price-graph-selection';
import { SiteDomainRepository } from '@domain/site/repositories/site.repository';
import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import { NatsClientService } from '@vritti/api-sdk/nats';
import { SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk/select';

@Injectable()
export class LeInventoryItemPricesGatewayService {
  private readonly logger = new Logger(LeInventoryItemPricesGatewayService.name);

  constructor(
    private readonly nats: NatsClientService,
    private readonly siteRepository: SiteDomainRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // The legal entity's sites where any supplier has priced the item, as select options
  async findSitesForSelect(
    inventoryItemId: string,
    legalEntityId: string | undefined,
    query: SelectOptionsQueryDto,
  ): Promise<SelectQueryResult> {
    if (!legalEntityId) return { options: [], hasMore: false, totalCount: 0 };
    this.logger.log(`le.inventoryItems.prices.siteIds — inventoryItemId: ${inventoryItemId}`);
    const siteIds = await this.nats.send<string[]>('commerce', 'le.inventoryItems.prices.siteIds', { inventoryItemId });
    return this.siteRepository.findForSelectOptions(legalEntityId, query, siteIds);
  }

  // Every supplier's standing for the item at the site in the table's context on a day — the day picked in the context
  // bar and not saved, today when omitted
  async findTable(
    inventoryItemId: string,
    userId: string,
    query: InventoryItemPricesTableQueryDto,
  ): Promise<ItemSupplierPriceComparisonTableResponseDto> {
    this.logger.log(`le.inventoryItems.prices.table — inventoryItemId: ${inventoryItemId}, asOf: ${query.asOf}`);
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `commerce-le-inventory-item-${inventoryItemId}-prices`,
    );
    const { result, count } = await this.nats.send<{ result: ItemSupplierPriceComparisonResponseDto[]; count: number }>(
      'commerce',
      'le.inventoryItems.prices.table',
      { inventoryItemId, asOf: query.asOf, ...state },
    );
    return { result, count, state, activeViewId };
  }

  // The sites where any supplier has priced the item, in the site picker's order
  async findPricedSiteIds(
    inventoryItemId: string,
    legalEntityId: string | undefined,
  ): Promise<InventoryItemPricedSitesResponseDto> {
    this.logger.log(`le.inventoryItems.prices.siteIds — inventoryItemId: ${inventoryItemId}`);
    if (!legalEntityId) return { siteIds: [] };
    const siteIds = await this.nats.send<string[]>('commerce', 'le.inventoryItems.prices.siteIds', { inventoryItemId });
    if (siteIds.length === 0) return { siteIds };
    const query = Object.assign(new SelectOptionsQueryDto(), { limit: siteIds.length });
    const { options } = await this.siteRepository.findForSelectOptions(legalEntityId, query, siteIds);
    return { siteIds: options.map((option) => String(option.value)) };
  }

  // The item's suppliers' prices at the graph's site in its window, per the item's primary unit, from the graph's
  // saved selection; with no site saved yet, the first priced site
  async findGraph(
    inventoryItemId: string,
    legalEntityId: string | undefined,
    userId: string,
  ): Promise<InventoryItemPriceGraphResponseDto> {
    this.logger.log(`le.inventoryItems.prices.graph — inventoryItemId: ${inventoryItemId}`);
    const { state } = await this.dataTableStateService.getCurrentState(
      userId,
      `commerce-le-inventory-item-${inventoryItemId}-price-graph`,
    );
    const saved = readPriceGraphSelection(state);
    const siteId = saved.siteId ?? (await this.findPricedSiteIds(inventoryItemId, legalEntityId)).siteIds[0] ?? null;
    const selection = { ...saved, siteId };
    if (!siteId) return { siteId: null, uomSymbol: null, suppliers: [], supplierCount: 0, selection };

    const history = await this.nats.send<InventoryItemPriceHistoryResponseDto>(
      'commerce',
      'le.inventoryItems.prices.findAtSite',
      {
        inventoryItemId,
        siteId,
        from: selection.from,
        to: selection.to,
        supplierIds: selection.supplierIds,
        mrpIds: selection.mrpIds,
      },
    );
    return { ...history, selection };
  }

  // The item's MRPs that supplier prices at a site were agreed against within a window, as select options
  findMrps(
    inventoryItemId: string,
    siteId: string,
    query: InventoryItemPriceOptionsQueryDto,
  ): Promise<SelectQueryResult> {
    this.logger.log(`le.inventoryItems.prices.mrps — inventoryItemId: ${inventoryItemId}, siteId: ${siteId}`);
    return this.nats.send('commerce', 'le.inventoryItems.prices.mrps', { inventoryItemId, siteId, ...query });
  }

  // The suppliers with a price for the item at a site within a window, as select options
  findSuppliers(
    inventoryItemId: string,
    siteId: string,
    query: InventoryItemPriceOptionsQueryDto,
  ): Promise<SelectQueryResult> {
    this.logger.log(`le.inventoryItems.prices.suppliers — inventoryItemId: ${inventoryItemId}, siteId: ${siteId}`);
    return this.nats.send('commerce', 'le.inventoryItems.prices.suppliers', { inventoryItemId, siteId, ...query });
  }
}
