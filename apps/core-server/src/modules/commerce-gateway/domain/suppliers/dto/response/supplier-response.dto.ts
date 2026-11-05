import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierResponseDto {
  @ApiProperty({ description: 'Supplier ID' })
  id: string;

  @ApiProperty({ description: 'The party this supplier represents' })
  partyId: string;

  @ApiProperty({ description: 'Display name of the linked party', example: 'Acme Foods Pvt Ltd' })
  partyName: string;

  @ApiPropertyOptional({ description: 'Type of the linked party (COMPANY or PERSON); on the detail response' })
  partyType?: string;

  @ApiProperty({ description: 'Unique supplier code', example: 'SUP-001' })
  code: string;

  @ApiProperty({ description: 'Default supplier currency code (ISO 4217)', example: 'INR' })
  currencyCode: string;

  @ApiProperty({
    type: [String],
    description: 'Every currency the supplier trades in, the default included',
    example: ['INR', 'USD'],
  })
  currencyCodes: string[];

  @ApiProperty({ description: 'Payment term new site enrollments start from' })
  defaultPaymentTermId: string;

  @ApiProperty({ description: 'Name of the default payment term' })
  defaultPaymentTermName: string;

  @ApiPropertyOptional({ description: 'Additional notes', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Whether purchasing from this supplier is blocked at every site' })
  purchasingBlocked: boolean;

  @ApiProperty({ description: 'Whether payments to this supplier are blocked from every site' })
  paymentBlocked: boolean;

  @ApiProperty({ description: 'Whether the supplier is active' })
  isActive: boolean;

  @ApiPropertyOptional({
    description: "The party's tax ID (PAN, TIN, EIN, UTR or ABN) from its identifiers, when on record; detail only",
    nullable: true,
  })
  partyTaxId?: string | null;

  @ApiPropertyOptional({ description: 'The identifier type of partyTaxId; detail only', nullable: true })
  partyTaxIdType?: string | null;

  @ApiProperty({ description: 'ISO timestamp of creation' })
  createdAt: string;

  @ApiProperty({ description: 'ISO timestamp of last update' })
  updatedAt: string;
}
