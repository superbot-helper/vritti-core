import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID, Matches } from 'class-validator';

export class InventoryItemPricesTableQueryDto {
  @ApiPropertyOptional({ description: "Site to read the prices at; the item's default priced site when omitted" })
  @IsOptional()
  @IsUUID('7')
  site?: string;

  @ApiPropertyOptional({
    description: 'Day the prices in force are read on (YYYY-MM-DD); today when omitted',
    example: '2026-11-14',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'asOf must be YYYY-MM-DD' })
  asOf?: string;
}
