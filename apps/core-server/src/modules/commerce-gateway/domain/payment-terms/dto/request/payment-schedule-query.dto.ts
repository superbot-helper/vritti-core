import { ApiProperty } from '@nestjs/swagger';
import { type CurrencyCode, IsCurrencyCode } from '@vritti/api-sdk/money';
import { IsDateString, IsNumberString, Matches } from 'class-validator';

export class PaymentScheduleQueryDto {
  @ApiProperty({ description: 'Invoice amount in major units', example: '100000.00' })
  @IsNumberString()
  amount: string;

  @ApiProperty({ description: 'ISO 4217 currency of the amount', example: 'INR' })
  @IsCurrencyCode()
  currency: CurrencyCode;

  @ApiProperty({
    description: 'Invoice or goods-receipt date the term counts from (YYYY-MM-DD)',
    example: '2026-11-14',
  })
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;
}
