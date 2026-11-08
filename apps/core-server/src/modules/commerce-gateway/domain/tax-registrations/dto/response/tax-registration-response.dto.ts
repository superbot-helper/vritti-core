import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaxRegistrationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() legalEntityId: string;
  @ApiProperty({ description: 'Uppercase ISO 3166-1 alpha-2 country', example: 'IN' }) countryCode: string;
  @ApiPropertyOptional({ description: 'Null for a national registration', nullable: true })
  jurisdictionId: string | null;
  @ApiPropertyOptional({ nullable: true }) jurisdictionName: string | null;
  @ApiPropertyOptional({ nullable: true }) jurisdictionCode: string | null;
  @ApiProperty({ description: 'GSTIN / VAT number as issued', example: '36ABCDE1234F1Z5' })
  registrationNumber: string;
  @ApiProperty({ enum: ['GSTIN', 'VAT', 'TIN', 'OTHER'] }) registrationType: string;
  @ApiProperty({ description: 'The entity files under this one by default' }) isPrimary: boolean;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}
