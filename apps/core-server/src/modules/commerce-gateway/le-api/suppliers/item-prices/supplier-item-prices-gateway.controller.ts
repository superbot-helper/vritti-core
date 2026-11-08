import { AddSupplierItemPriceDto } from '@commerce/supplier-item-prices/dto/request/add-supplier-item-price.dto';
import { SupplierItemPriceHistoryQueryDto } from '@commerce/supplier-item-prices/dto/request/supplier-item-price-history-query.dto';
import { UpdateSupplierItemPriceDto } from '@commerce/supplier-item-prices/dto/request/update-supplier-item-price.dto';
import type { SupplierItemPriceHistoryResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-price-history-response.dto';
import type { SupplierItemPriceResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-price-response.dto';
import type { SupplierItemPriceTableResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-price-table-response.dto';
import type { SupplierItemPricedSitesResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-priced-sites-response.dto';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthType, Require, UserId } from '@vritti/api-sdk/auth';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { LE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { SessionTypeValues } from '@/db/schema';
import { RequireFeature, RequirePermission } from '@/rbac/decorators';
import { LegalEntityId, OrgId } from '@/security/decorators';
import { ApiSupplierItemPricesTable } from './docs/supplier-item-prices-gateway.docs';
import { SupplierItemPricesGatewayService } from './services/supplier-item-prices-gateway.service';

// A supplier item's validity-dated prices across the legal entity's sites: the table, the price history, and their records
@ApiTags('Commerce - Supplier Item Prices')
@ApiBearerAuth()
@Require(AuthType.Session, SessionTypeValues.WEB)
@RequireFeature(LE_SUPPLIERS.featureCode)
@Controller('le/suppliers')
export class SupplierItemPricesGatewayController {
  private readonly logger = new Logger(SupplierItemPricesGatewayController.name);

  constructor(private readonly service: SupplierItemPricesGatewayService) {}

  // Returns the price timeline of a supplier item at the site in the table's context
  @Get(':id/items/:itemId/prices/table')
  @RequirePermission(LE_SUPPLIERS.items.prices.view)
  @ApiSupplierItemPricesTable()
  getItemPricesTable(
    @Param('id') supplierId: string,
    @Param('itemId') itemId: string,
    @UserId() userId: string,
  ): Promise<SupplierItemPriceTableResponseDto> {
    this.logger.log(`GET /commerce-api/le/suppliers/${supplierId}/items/${itemId}/prices/table`);
    return this.service.findItemPricesTable(itemId, userId);
  }

  // Returns the sites a supplier item has prices at, in the site picker's order
  @Get(':id/items/:itemId/prices/site-ids')
  @RequirePermission(LE_SUPPLIERS.items.prices.view)
  getItemPricedSiteIds(
    @Param('id') supplierId: string,
    @Param('itemId') itemId: string,
    @LegalEntityId() legalEntityId: string | undefined,
  ): Promise<SupplierItemPricedSitesResponseDto> {
    this.logger.log(`GET /commerce-api/le/suppliers/${supplierId}/items/${itemId}/prices/site-ids`);
    return this.service.findItemPricedSiteIds(itemId, legalEntityId);
  }

  // Returns a supplier item's price windows in a date range at the asked sites, or at every priced site
  @Get(':id/items/:itemId/price-history')
  @RequirePermission(LE_SUPPLIERS.items.prices.view)
  getItemPriceHistory(
    @Param('id') supplierId: string,
    @Param('itemId') itemId: string,
    @Query() query: SupplierItemPriceHistoryQueryDto,
    @LegalEntityId() legalEntityId: string | undefined,
    @OrgId() orgId: string,
  ): Promise<SupplierItemPriceHistoryResponseDto> {
    this.logger.log(`GET /commerce-api/le/suppliers/${supplierId}/items/${itemId}/price-history`);
    return this.service.findItemPriceHistory(itemId, query, legalEntityId, orgId);
  }

  // Adds a price record to a supplier item's timeline
  @Post(':id/items/:itemId/prices')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(LE_SUPPLIERS.items.prices.add)
  addItemPrice(
    @Param('id') supplierId: string,
    @Param('itemId') itemId: string,
    @Body() dto: AddSupplierItemPriceDto,
  ): Promise<CreateResponseDto<SupplierItemPriceResponseDto[]>> {
    this.logger.log(`POST /commerce-api/le/suppliers/${supplierId}/items/${itemId}/prices`);
    return this.service.addItemPrice(itemId, dto);
  }

  // Updates a supplier item price record
  @Patch(':id/items/:itemId/prices/:priceId')
  @RequirePermission(LE_SUPPLIERS.items.prices.edit)
  updateItemPrice(
    @Param('id') supplierId: string,
    @Param('itemId') itemId: string,
    @Param('priceId') priceId: string,
    @Body() dto: UpdateSupplierItemPriceDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /commerce-api/le/suppliers/${supplierId}/items/${itemId}/prices/${priceId}`);
    return this.service.updateItemPrice(priceId, dto);
  }

  // Deletes a supplier item price record
  @Delete(':id/items/:itemId/prices/:priceId')
  @RequirePermission(LE_SUPPLIERS.items.prices.delete)
  deleteItemPrice(
    @Param('id') supplierId: string,
    @Param('itemId') itemId: string,
    @Param('priceId') priceId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /commerce-api/le/suppliers/${supplierId}/items/${itemId}/prices/${priceId}`);
    return this.service.deleteItemPrice(priceId);
  }
}
