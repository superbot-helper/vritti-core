import { IsBoolean, IsUUID } from 'class-validator';

export class SetSupplierPaymentBlockedDto {
  @IsUUID('7')
  id: string;

  @IsBoolean()
  paymentBlocked: boolean;
}
