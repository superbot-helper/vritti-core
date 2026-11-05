import type { SupplierItemPriceDto } from '@domain/supplier-item-prices/dto/entity/supplier-item-price.dto';
import type { SupplierItemPriceHistoryDto } from '@domain/supplier-item-prices/dto/entity/supplier-item-price-history.dto';
import { AddLeSupplierItemPriceDto } from '@domain/supplier-item-prices/dto/request/add-le-supplier-item-price.dto';
import { UpdateSupplierItemPriceDto } from '@domain/supplier-item-prices/dto/request/update-supplier-item-price.dto';
import { SupplierItemPricesDomainService } from '@domain/supplier-item-prices/services/supplier-item-prices.service';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { TableViewState } from '@vritti/api-sdk/data-table';
import { type NatsHeaders, RpcNatsHeaders } from '@vritti/api-sdk/nats';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';

@Controller()
export class SupplierSiteItemPricesController {
  private readonly logger = new Logger(SupplierSiteItemPricesController.name);

  constructor(private readonly service: SupplierItemPricesDomainService) {}

  // Returns the paginated price timeline of a supplier item at one site
  @MessagePattern({ cmd: 'le.suppliers.siteItems.prices.table' })
  table(
    @Payload() data: { supplierItemId: string; siteId: string } & TableViewState,
  ): Promise<{ result: SupplierItemPriceDto[]; count: number }> {
    const { supplierItemId, siteId, ...state } = data;
    this.logger.log(`le.suppliers.siteItems.prices.table — supplierItemId: ${supplierItemId}, siteId: ${siteId}`);
    return this.service.findPricesForTable(supplierItemId, siteId, state);
  }

  // Returns the sites where a supplier item has prices
  @MessagePattern({ cmd: 'le.suppliers.siteItems.prices.siteIds' })
  siteIds(@Payload() data: { supplierItemId: string }): Promise<string[]> {
    this.logger.log(`le.suppliers.siteItems.prices.siteIds — supplierItemId: ${data.supplierItemId}`);
    return this.service.findSiteIdsWithSupplierItemPrices(data.supplierItemId);
  }

  // Returns a supplier item's price windows at the given sites within a date range, grouped by site
  @MessagePattern({ cmd: 'le.suppliers.siteItems.prices.priceHistory' })
  priceHistory(
    @Payload() data: { supplierItemId: string; siteIds: string[]; from: string; to: string },
  ): Promise<SupplierItemPriceHistoryDto> {
    const { supplierItemId, ...options } = data;
    this.logger.log(`le.suppliers.siteItems.prices.priceHistory — supplierItemId: ${supplierItemId}`);
    return this.service.findPriceHistory(supplierItemId, options);
  }

  // Adds a validity-dated price to a supplier item's timeline
  @MessagePattern({ cmd: 'le.suppliers.siteItems.prices.create' })
  create(
    @Payload() dto: AddLeSupplierItemPriceDto,
    @RpcNatsHeaders() headers: NatsHeaders,
  ): Promise<CreateResponseDto<SupplierItemPriceDto[]>> {
    this.logger.log(
      `le.suppliers.siteItems.prices.create — supplierItemId: ${dto.supplierItemId}, validFrom: ${dto.validFrom}`,
    );
    const { siteIds, ...price } = dto;
    return this.service.addPrice(price, siteIds, headers.userId || null);
  }

  // Updates a price row's amount, scheme, or end date
  @MessagePattern({ cmd: 'le.suppliers.siteItems.prices.update' })
  update(@Payload() dto: UpdateSupplierItemPriceDto): Promise<SuccessResponseDto> {
    this.logger.log(`le.suppliers.siteItems.prices.update — id: ${dto.id}`);
    return this.service.updatePrice(dto);
  }

  // Deletes a price row from a supplier item's timeline
  @MessagePattern({ cmd: 'le.suppliers.siteItems.prices.delete' })
  delete(@Payload() data: { id: string }): Promise<SuccessResponseDto> {
    this.logger.log(`le.suppliers.siteItems.prices.delete — id: ${data.id}`);
    return this.service.deletePrice(data.id);
  }
}
