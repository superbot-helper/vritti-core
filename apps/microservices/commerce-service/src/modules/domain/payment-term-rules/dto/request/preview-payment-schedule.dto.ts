import { type CurrencyCode, IsCurrencyCode } from '@vritti/api-sdk/money';
import { IsDateString, IsNumberString, IsUUID, Matches } from 'class-validator';

export class PreviewPaymentScheduleDto {
  @IsUUID('7')
  paymentTermId: string;

  @IsNumberString()
  amount: string;

  @IsCurrencyCode()
  currency: CurrencyCode;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;
}
