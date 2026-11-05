import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class BulkSetSupplierDefaultPaymentTermDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('7', { each: true })
  ids: string[];

  @IsUUID('7')
  defaultPaymentTermId: string;
}
