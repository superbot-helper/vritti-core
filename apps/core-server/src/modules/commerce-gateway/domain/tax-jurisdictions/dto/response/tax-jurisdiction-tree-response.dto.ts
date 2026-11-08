import { ApiProperty } from '@nestjs/swagger';

const TAX_JURISDICTION_LEVELS = ['STATE', 'COUNTY', 'CITY', 'DISTRICT'] as const;

export class TaxJurisdictionTreeResponseDto {
  @ApiProperty({ description: 'Tax jurisdiction ID' })
  id: string;

  @ApiProperty({ description: 'Tax jurisdiction name' })
  name: string;

  @ApiProperty({ description: 'Unique code within the org', example: 'in-ts' })
  code: string;

  @ApiProperty({
    description: 'Hierarchy level of the jurisdiction',
    enum: TAX_JURISDICTION_LEVELS,
  })
  level: (typeof TAX_JURISDICTION_LEVELS)[number];

  @ApiProperty({
    description: 'Uppercase ISO 3166-1 alpha-2 country code; top-level nodes are grouped by it',
    example: 'IN',
  })
  countryCode: string;

  @ApiProperty({
    description: 'Child jurisdictions',
    type: () => TaxJurisdictionTreeResponseDto,
    isArray: true,
    required: false,
  })
  children?: TaxJurisdictionTreeResponseDto[];
}
