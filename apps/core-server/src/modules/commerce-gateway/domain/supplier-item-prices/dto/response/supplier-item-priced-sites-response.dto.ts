import { ApiProperty } from '@nestjs/swagger';

export class SupplierItemPricedSitesResponseDto {
  @ApiProperty({ type: [String], description: "Sites the supplier item has prices at, in the site picker's order" })
  siteIds: string[];
}
