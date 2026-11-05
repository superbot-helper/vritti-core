import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetSupplierPaymentBlockedDto {
  @ApiProperty({ description: 'Holds payments to the supplier' })
  @IsBoolean()
  paymentBlocked: boolean;
}
