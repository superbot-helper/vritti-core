import { ApiProperty } from '@nestjs/swagger';

const TAX_JURISDICTION_LEVELS = ['STATE', 'COUNTY', 'CITY', 'DISTRICT'] as const;

export class TaxJurisdictionResponseDto {
  @ApiProperty({ description: 'Tax jurisdiction ID' })
  id: string;

  @ApiProperty({ description: 'Unique code within the org', example: 'us-ca' })
  code: string;

  @ApiProperty({ description: 'Human-readable name', example: 'California' })
  name: string;

  @ApiProperty({
    description: 'Hierarchy level of the jurisdiction',
    enum: TAX_JURISDICTION_LEVELS,
  })
  level: (typeof TAX_JURISDICTION_LEVELS)[number];

  @ApiProperty({ description: 'Parent jurisdiction ID, or null for a state', nullable: true })
  parentId: string | null;

  @ApiProperty({
    description: 'Resolved parent jurisdiction name, or null for a state',
    nullable: true,
  })
  parentName: string | null;

  @ApiProperty({ description: 'Uppercase ISO 3166-1 alpha-2 country code', example: 'IN' })
  countryCode: string;

  @ApiProperty({ description: 'Region/state code within the country', nullable: true })
  regionCode: string | null;

  @ApiProperty({ description: 'Tax union the jurisdiction belongs to (e.g. EU, GCC)', nullable: true })
  taxUnion: string | null;

  @ApiProperty({ description: 'Whether the jurisdiction is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether this jurisdiction has child jurisdictions' })
  hasChildren: boolean;

  @ApiProperty({
    description:
      'Whether this jurisdiction can be deleted — false while it has children or registrations or companies name it',
  })
  canDelete: boolean;

  @ApiProperty({ description: 'ISO timestamp of creation' })
  createdAt: string;

  @ApiProperty({ description: 'ISO timestamp of last update' })
  updatedAt: string;
}
