import { InventoryItemPricedSitesResponseDto } from '@commerce/inventory-items/dto/response/inventory-item-priced-sites-response.dto';
import { ItemSupplierPriceComparisonTableResponseDto } from '@commerce/inventory-items/dto/response/item-supplier-price-comparison-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

const ID = { name: 'id', description: 'Inventory item ID' };

export function ApiInventoryItemPricesTable() {
  return applyDecorators(
    ApiOperation({
      summary: 'Supplier prices table of an inventory item',
      description:
        "Every supplier's standing for the item at the site in the caller's saved table state (`filters.context`, field `site`) on the `asOf` day: the price in force, per the item's primary unit and after its free-goods scheme. The site is required context — a state without one has no rows.",
    }),
    ApiParam(ID),
    ApiResponse({ status: 200, type: ItemSupplierPriceComparisonTableResponseDto }),
  );
}

export function ApiInventoryItemPricedSiteIds() {
  return applyDecorators(
    ApiOperation({
      summary: 'Sites an inventory item is priced at',
      description:
        "The legal entity's sites where any supplier has priced the item, in the site picker's order — what the prices table's site context offers, the first being its default.",
    }),
    ApiParam(ID),
    ApiResponse({ status: 200, type: InventoryItemPricedSitesResponseDto }),
  );
}
