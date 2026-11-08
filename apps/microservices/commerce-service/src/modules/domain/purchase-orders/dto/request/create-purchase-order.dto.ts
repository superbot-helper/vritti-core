import { IsDateTime, Trim } from '@vritti/api-sdk/decorators';
import { IsCurrencyCode } from '@vritti/api-sdk/money';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsUUID('7')
  supplierId: string;

  @IsOptional()
  @IsCurrencyCode()
  currencyCode?: string;

  @IsDateString()
  orderDate: string;

  @IsOptional()
  @IsDateTime()
  expectedBy?: string;

  @Trim()
  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  exchangeRate?: number;
}
