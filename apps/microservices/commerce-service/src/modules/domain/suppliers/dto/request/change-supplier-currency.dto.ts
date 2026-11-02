import { ArrayIncludesField } from '@vritti/api-sdk/decorators';
import { IsCurrencyCode } from '@vritti/api-sdk/money';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ChangeSupplierCurrencyDto {
  @IsUUID('7')
  id: string;

  // The default currency — new supplier items, quotations and POs start in it
  @IsCurrencyCode()
  currencyCode: string;

  // Every currency the supplier trades in; the default is always among them
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsCurrencyCode({ each: true })
  @ArrayIncludesField('currencyCode', { message: 'Must include the default currency' })
  currencyCodes: string[];
}
