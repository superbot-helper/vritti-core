import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SetSupplierDefaultPaymentTermDto {
  @ApiProperty({ description: 'Payment term new site enrollments start from' })
  @IsUUID('7')
  defaultPaymentTermId: string;
}
