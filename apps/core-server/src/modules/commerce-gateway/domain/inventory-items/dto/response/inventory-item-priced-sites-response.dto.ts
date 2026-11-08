import { ApiProperty } from '@nestjs/swagger';

export class InventoryItemPricedSitesResponseDto {
  @ApiProperty({
    type: [String],
    description: "Sites where any supplier has priced the item, in the site picker's order",
  })
  siteIds: string[];
}
