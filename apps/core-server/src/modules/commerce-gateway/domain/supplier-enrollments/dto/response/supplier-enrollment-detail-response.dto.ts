import { ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierEnrollmentRowResponseDto } from './supplier-enrollment-row-response.dto';

export class SupplierEnrollmentDetailResponseDto extends SupplierEnrollmentRowResponseDto {
  @ApiPropertyOptional({
    description: "The party's tax ID (PAN, TIN, EIN, UTR or ABN) from its identifiers, when on record",
    nullable: true,
  })
  partyTaxId: string | null;

  @ApiPropertyOptional({ description: 'The identifier type of partyTaxId', nullable: true })
  partyTaxIdType: string | null;
}
