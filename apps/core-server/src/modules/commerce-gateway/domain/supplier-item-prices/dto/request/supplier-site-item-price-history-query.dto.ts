import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class SupplierSiteItemPriceHistoryQueryDto {
  @ApiProperty({ description: 'Only windows still in force on or after this date (YYYY-MM-DD)' })
  @IsDateString()
  from: string;

  @ApiProperty({ description: 'Only windows starting on or before this date (YYYY-MM-DD)' })
  @IsDateString()
  to: string;
}
