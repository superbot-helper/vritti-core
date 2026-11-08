import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO31661Alpha2, IsOptional, IsString, IsUppercase } from 'class-validator';

export class TaxJurisdictionTreeQueryDto {
  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Uppercase ISO 3166-1 alpha-2 country code to show only that country',
    example: 'IN',
  })
  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  country?: string;
}
