import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/select';
import { IsISO31661Alpha2, IsOptional, IsUppercase } from 'class-validator';

export class TaxComponentsSelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({
    description: "Uppercase ISO 3166-1 alpha-2 country code to offer only that country's tax components",
    example: 'IN',
  })
  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  country?: string;
}
