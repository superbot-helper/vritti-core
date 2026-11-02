import { ArrayIncludesField, Trim } from '@vritti/api-sdk/decorators';
import { IsCurrencyCode } from '@vritti/api-sdk/money';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSupplierDto {
  @IsUUID('7')
  partyId: string;

  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsNotEmpty()
  @IsCurrencyCode()
  currencyCode: string;

  // Every currency the supplier trades in; the default is always among them
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsCurrencyCode({ each: true })
  @ArrayIncludesField('currencyCode', { message: 'Must include the default currency' })
  currencyCodes: string[];

  @IsUUID('7')
  defaultPaymentTermId: string;

  @Trim({ nullify: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;

  @IsBoolean()
  purchasingBlocked: boolean;

  @IsBoolean()
  paymentBlocked: boolean;

  @IsBoolean()
  isActive: boolean;
}
