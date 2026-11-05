import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSupplierSiteItemDto {
  @ApiPropertyOptional({ description: 'Whether this is the preferred supplier for the item at the site' })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @ApiPropertyOptional({ description: "Pins a lead time to this site instead of the supplier item's", example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  leadTimeDays?: number | null;

  @ApiPropertyOptional({ description: "Drops the site's own lead time and follows the supplier item's default again" })
  @IsOptional()
  @IsBoolean()
  followDefaultLeadTime?: boolean;
}
