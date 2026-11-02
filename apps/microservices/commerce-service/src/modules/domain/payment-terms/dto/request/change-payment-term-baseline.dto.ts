import { IsIn, IsUUID } from 'class-validator';
import { type PaymentTermBaseline, paymentTermBaselineEnum } from '@/db/schema';

export class ChangePaymentTermBaselineDto {
  @IsUUID('7')
  id: string;

  @IsIn(paymentTermBaselineEnum.enumValues)
  baseline: PaymentTermBaseline;
}
