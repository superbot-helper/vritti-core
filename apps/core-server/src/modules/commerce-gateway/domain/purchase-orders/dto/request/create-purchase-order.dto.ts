import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateTime, Trim } from '@vritti/api-sdk/decorators';
import { IsCurrencyCode } from '@vritti/api-sdk/money';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID('7')
  supplierId: string;

  @ApiPropertyOptional({
    description: "One of the supplier's currencies the PO is in; the supplier's default when omitted",
    example: 'USD',
  })
  @IsOptional()
  @IsCurrencyCode()
  currencyCode?: string;

  @ApiProperty({ description: 'Order date (YYYY-MM-DD)', example: '2026-04-10' })
  @IsDateString()
  orderDate: string;

  @ApiPropertyOptional({ description: 'Expected-by date/time (UTC ISO string)', example: '2026-04-25T20:00:00.000Z' })
  @IsOptional()
  @IsString()
  @IsDateTime()
  expectedBy?: string;

  @Trim()
  @ApiPropertyOptional({ description: 'Notes', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({
    description:
      "1 unit of the PO currency in the legal entity's currency. Required when the two differ, ignored when they match.",
    example: 83.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  exchangeRate?: number;
}
