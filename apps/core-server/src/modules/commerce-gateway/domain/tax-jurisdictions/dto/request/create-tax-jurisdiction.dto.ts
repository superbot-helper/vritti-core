import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsCode, Trim } from '@vritti/api-sdk/decorators';
import {
  IsBoolean,
  IsIn,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  MaxLength,
} from 'class-validator';

const TAX_JURISDICTION_LEVELS = ['STATE', 'COUNTY', 'CITY', 'DISTRICT'] as const;

export class CreateTaxJurisdictionDto {
  @Trim({ nullify: false })
  @ApiProperty({ description: 'Unique code within the org', example: 'us-ca' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsCode()
  code: string;

  @Trim({ nullify: false })
  @ApiProperty({ description: 'Human-readable name', example: 'California' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Hierarchy level of the jurisdiction',
    enum: TAX_JURISDICTION_LEVELS,
    example: 'STATE',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(TAX_JURISDICTION_LEVELS)
  level: (typeof TAX_JURISDICTION_LEVELS)[number];

  @ApiPropertyOptional({
    description:
      'Parent jurisdiction in the same country, one level up: a county under a state, a city under a county or state, a district under any. A state has none.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('7')
  parentId?: string | null;

  @ApiProperty({ description: 'Uppercase ISO 3166-1 alpha-2 country code', example: 'IN' })
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode: string;

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

  @ApiProperty({ description: 'Whether the jurisdiction is active' })
  @IsBoolean()
  isActive: boolean;
}
