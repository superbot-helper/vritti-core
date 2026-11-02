import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { PAYMENT_TERM_BASELINES, type PaymentTermBaseline } from '../response/payment-term-response.dto';

export class ChangePaymentTermBaselineDto {
  @ApiProperty({ description: 'Date the due days count from', enum: PAYMENT_TERM_BASELINES })
  @IsIn(PAYMENT_TERM_BASELINES)
  baseline: PaymentTermBaseline;
}
