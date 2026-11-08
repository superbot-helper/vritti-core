import { Trim } from '@vritti/api-sdk/decorators';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateSupplierInvoiceDto {
  @IsUUID('7')
  id: string;

  @Trim({ nullify: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  exchangeRate?: number;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
