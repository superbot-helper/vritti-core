import type { CurrencyAmountDto } from '@vritti/api-sdk/money';
import type { PaymentTermBaseline } from '@/db/schema';

export class PaymentScheduleDiscountDto {
  percent: number;
  days: number;
  payBy: string;
  amount: CurrencyAmountDto;
  payable: CurrencyAmountDto;
}

export class PaymentScheduleInstalmentDto {
  ruleId: string;
  percent: number;
  dueDays: number;
  dueDate: string;
  amount: CurrencyAmountDto;
  discount: PaymentScheduleDiscountDto | null;
}

export class PaymentScheduleDto {
  baseline: PaymentTermBaseline;
  baselineDate: string;
  total: CurrencyAmountDto;
  allocated: CurrencyAmountDto;
  unallocated: CurrencyAmountDto;
  maxSavings: CurrencyAmountDto;
  instalments: PaymentScheduleInstalmentDto[];
}
