import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import {
  IsBoolean,
  IsIn,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
  IsUppercase,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateTaxComponentDto {
  @ApiPropertyOptional({
    description: 'Uppercase ISO 3166-1 alpha-2 country; fixed once a tax-group rate uses the component',
    example: 'IN',
  })
  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode?: string;

  @Trim({ nullify: false })
  @ApiPropertyOptional({ description: 'Human-readable name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Taxing authority level',
    enum: ['FEDERAL', 'STATE', 'COUNTY', 'CITY', 'SPECIAL'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['FEDERAL', 'STATE', 'COUNTY', 'CITY', 'SPECIAL'])
  authorityLevel?: string;

  @ApiPropertyOptional({ description: 'Whether the tax is recoverable (input credit)' })
  @IsOptional()
  @IsBoolean()
  isRecoverable?: boolean;

  @ApiPropertyOptional({ description: 'Whether the tax is a withholding tax' })
  @IsOptional()
  @IsBoolean()
  isWithholding?: boolean;

  @ApiPropertyOptional({ description: 'Whether the tax component is selectable' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
