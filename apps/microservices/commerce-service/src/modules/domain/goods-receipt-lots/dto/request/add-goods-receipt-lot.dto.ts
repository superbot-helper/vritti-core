import { Trim } from '@vritti/api-sdk/decorators';
import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddGoodsReceiptLotDto {
  @IsUUID('7')
  goodsReceiptId: string;

  @IsUUID('7')
  itemId: string;

  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lotNumber: string;

  @IsOptional()
  @IsDateString()
  manufacturingDate?: string | null;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsCurrency()
  mrp?: CurrencyAmountDto | null;
}
