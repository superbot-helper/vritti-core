import { ApiProperty } from '@nestjs/swagger';
import { TaxClassGroupResponseDto } from './tax-class-group-response.dto';

export class TaxClassMappingResponseDto {
  @ApiProperty({ description: 'Tax class ID' })
  taxClassId: string;

  @ApiProperty({ description: 'Tax class code', example: 'medicines' })
  taxClassCode: string;

  @ApiProperty({ description: 'Tax class name', example: 'Medicines' })
  taxClassName: string;

  @ApiProperty({
    description: 'Uppercase ISO 3166-1 alpha-2 country code the row’s mapping is shown for',
    example: 'IN',
  })
  countryCode: string;

  @ApiProperty({
    description:
      'The class’s mapping in the country valid today without a price limit; null when the class is unmapped',
    type: () => TaxClassGroupResponseDto,
    nullable: true,
  })
  mapping: TaxClassGroupResponseDto | null;
}
