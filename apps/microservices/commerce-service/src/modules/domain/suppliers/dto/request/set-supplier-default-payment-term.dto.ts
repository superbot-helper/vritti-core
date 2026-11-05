import { IsUUID } from 'class-validator';

export class SetSupplierDefaultPaymentTermDto {
  @IsUUID('7')
  id: string;

  @IsUUID('7')
  defaultPaymentTermId: string;
}
