import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class SupplierItemPriceHistoryQueryDto {
  @ApiProperty({ description: 'Only windows still in force on or after this date (YYYY-MM-DD)' })
  @IsDateString()
  from: string;

  @ApiProperty({ description: 'Only windows starting on or before this date (YYYY-MM-DD)' })
  @IsDateString()
  to: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Sites to chart (comma-separated or repeated); every site the item is priced at when omitted',
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : String(value).split(',').filter(Boolean)))
  @IsArray()
  @IsUUID('7', { each: true })
  sites?: string[];
}
