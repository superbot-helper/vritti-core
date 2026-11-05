import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class BulkSetSupplierDefaultPaymentTermDto {
  @ApiProperty({ type: [String], description: 'Supplier IDs to update.' })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('7', { each: true })
  ids: string[];

  @ApiProperty({ description: 'Payment term new site enrollments start from' })
  @IsUUID('7')
  defaultPaymentTermId: string;
}
