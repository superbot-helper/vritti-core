import { SupplierItemPriceTableResponseDto } from '@commerce/supplier-item-prices/dto/response/supplier-item-price-table-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiSupplierItemPricesTable() {
  return applyDecorators(
    ApiOperation({
      summary: 'Price timeline of a supplier item',
      description:
        "One page of a supplier item's validity-dated prices, newest first, at the site in the caller's saved table state (`filters.context`, field `site`). The site is applied as given — a site with no prices returns no rows; a state without one returns the item's prices at every site.",
    }),
    ApiParam({ name: 'id', description: 'Supplier ID' }),
    ApiParam({ name: 'itemId', description: 'Supplier item ID' }),
    ApiResponse({ status: 200, type: SupplierItemPriceTableResponseDto }),
  );
}
