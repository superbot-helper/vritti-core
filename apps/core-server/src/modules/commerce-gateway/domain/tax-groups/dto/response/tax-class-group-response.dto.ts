import { ApiProperty } from '@nestjs/swagger';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';

export class TaxClassGroupResponseDto {
  @ApiProperty({ description: 'Class mapping ID' })
  id: string;

  @ApiProperty({ description: 'Country of the mapping — always the group’s', example: 'IN' })
  countryCode: string;

  @ApiProperty({ description: 'Tax class mapped' })
  taxClassId: string;

  @ApiProperty({ description: 'Tax class code', example: 'medicines' })
  taxClassCode: string;

  @ApiProperty({ description: 'Tax class name', example: 'Medicines' })
  taxClassName: string;

  @ApiProperty({ description: 'Tax group the class is mapped to' })
  taxGroupId: string;

  @ApiProperty({ description: 'Tax group code', example: 'gst-5' })
  taxGroupCode: string;

  @ApiProperty({ description: 'Tax group name', example: 'GST 5%' })
  taxGroupName: string;

  @ApiProperty({
    description: 'Highest unit price the mapping applies to; null when it applies at any price',
    type: () => CurrencyAmountDto,
    nullable: true,
  })
  maxUnitPrice: CurrencyAmountDto | null;

  @ApiProperty({ description: 'First day the mapping applies (YYYY-MM-DD)', example: '2025-09-22' })
  validFrom: string;

  @ApiProperty({
    description: 'Last day the mapping applies (YYYY-MM-DD); null when open-ended',
    type: String,
    nullable: true,
  })
  validTo: string | null;

  @ApiProperty({ description: 'Whether the mapping applies today' })
  isCurrent: boolean;
}
