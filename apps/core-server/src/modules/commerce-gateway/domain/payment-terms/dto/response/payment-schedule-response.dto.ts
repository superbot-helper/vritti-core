import { ApiProperty } from '@nestjs/swagger';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import { PAYMENT_TERM_BASELINES, type PaymentTermBaseline } from './payment-term-response.dto';

export class PaymentScheduleDiscountResponseDto {
  @ApiProperty({ description: 'Early-payment discount percentage', example: 2 })
  percent: number;

  @ApiProperty({ description: 'Days after the baseline date the discount stays available', example: 10 })
  days: number;

  @ApiProperty({ description: 'Last date the discount can be taken (YYYY-MM-DD)', example: '2026-11-24' })
  payBy: string;

  @ApiProperty({ type: () => CurrencyAmountDto, description: 'Discount on this instalment' })
  amount: CurrencyAmountDto;

  @ApiProperty({ type: () => CurrencyAmountDto, description: 'Instalment amount after the discount' })
  payable: CurrencyAmountDto;
}

export class PaymentScheduleInstalmentResponseDto {
  @ApiProperty({ description: 'Rule this instalment comes from' })
  ruleId: string;

  @ApiProperty({ description: 'Share of the invoice', example: 50 })
  percent: number;

  @ApiProperty({ description: 'Days after the baseline date the instalment falls due', example: 30 })
  dueDays: number;

  @ApiProperty({ description: 'Due date (YYYY-MM-DD)', example: '2026-12-14' })
  dueDate: string;

  @ApiProperty({ type: () => CurrencyAmountDto, description: 'Amount due; instalments sum to the allocated total' })
  amount: CurrencyAmountDto;

  @ApiProperty({ type: () => PaymentScheduleDiscountResponseDto, nullable: true })
  discount: PaymentScheduleDiscountResponseDto | null;
}

export class PaymentScheduleResponseDto {
  @ApiProperty({ enum: PAYMENT_TERM_BASELINES })
  baseline: PaymentTermBaseline;

  @ApiProperty({ description: 'Date the due days count from (YYYY-MM-DD)', example: '2026-11-14' })
  baselineDate: string;

  @ApiProperty({ type: () => CurrencyAmountDto, description: 'Invoice amount' })
  total: CurrencyAmountDto;

  @ApiProperty({ type: () => CurrencyAmountDto, description: 'Sum of the instalments' })
  allocated: CurrencyAmountDto;

  @ApiProperty({ type: () => CurrencyAmountDto, description: 'Part of the invoice no rule covers yet' })
  unallocated: CurrencyAmountDto;

  @ApiProperty({ type: () => CurrencyAmountDto, description: 'Total saved when every discount is taken' })
  maxSavings: CurrencyAmountDto;

  @ApiProperty({ type: [PaymentScheduleInstalmentResponseDto], description: 'Instalments in due order' })
  instalments: PaymentScheduleInstalmentResponseDto[];
}
