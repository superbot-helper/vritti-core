import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';
import { IsBoolean, IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class AddPurchaseOrderItemDto {
  @IsUUID('7')
  purchaseOrderId: string;

  @IsUUID('7')
  supplierItemId: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  uomQty: number;

  @IsCurrency()
  unitPrice: CurrencyAmountDto;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  conversionRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  schemeBuyQty?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  schemeFreeQty?: number;

  @IsOptional()
  @IsBoolean()
  hasScheme?: boolean;
}
