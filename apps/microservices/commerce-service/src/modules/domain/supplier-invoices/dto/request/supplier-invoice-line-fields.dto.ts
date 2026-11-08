import { Trim } from '@vritti/api-sdk/decorators';
import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class SupplierInvoiceLineFieldsDto {
  @IsUUID('7')
  purchaseOrderItemId: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lotNumber?: string | null;

  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;

  @IsOptional()
  @IsCurrency()
  mrp?: CurrencyAmountDto | null;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  billedQty: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  freeQty: number;

  @IsCurrency()
  unitPrice: CurrencyAmountDto;

  @IsOptional()
  @IsCurrency()
  discountAmount?: CurrencyAmountDto;

  @IsOptional()
  @IsCurrency()
  taxAmount?: CurrencyAmountDto;
}
