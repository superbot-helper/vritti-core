import { ApiProperty } from '@nestjs/swagger';
import { TaxRegistrationResponseDto } from './tax-registration-response.dto';

export class TaxRegistrationsPageResponseDto {
  @ApiProperty({ type: [TaxRegistrationResponseDto] })
  result: TaxRegistrationResponseDto[];

  @ApiProperty()
  count: number;
}
