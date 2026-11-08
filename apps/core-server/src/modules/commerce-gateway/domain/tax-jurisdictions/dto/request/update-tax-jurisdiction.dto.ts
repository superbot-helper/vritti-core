import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import {
  IsBoolean,
  IsIn,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

const TAX_JURISDICTION_LEVELS = ['STATE', 'COUNTY', 'CITY', 'DISTRICT'] as const;

export class UpdateTaxJurisdictionDto {
  @Trim({ nullify: false })
  @ApiPropertyOptional({ description: 'Human-readable name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Hierarchy level of the jurisdiction',
    enum: TAX_JURISDICTION_LEVELS,
  })
  @IsOptional()
  @IsString()
  @IsIn(TAX_JURISDICTION_LEVELS)
  level?: (typeof TAX_JURISDICTION_LEVELS)[number];

  @ApiPropertyOptional({
    description:
      'Parent jurisdiction in the same country, one level up: a county under a state, a city under a county or state, a district under any. A state has none.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('7')
  parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Uppercase ISO 3166-1 alpha-2 country code; fixed once children, registrations or companies use it',
  })
  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode?: string;

  @Trim()
  @ApiPropertyOptional({ description: 'Region/state code within the country' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  regionCode?: string | null;

  @Trim()
  @ApiPropertyOptional({ description: 'Tax union the jurisdiction belongs to (e.g. EU, GCC)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxUnion?: string | null;

  @ApiPropertyOptional({ description: 'Whether the jurisdiction is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
