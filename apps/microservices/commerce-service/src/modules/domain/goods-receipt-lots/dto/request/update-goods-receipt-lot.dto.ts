import { Trim } from '@vritti/api-sdk/decorators';
import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateGoodsReceiptLotDto {
  @IsUUID('7')
  goodsReceiptId: string;

  @IsUUID('7')
  itemId: string;

  @IsUUID('7')
  lotId: string;

  @Trim({ nullify: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lotNumber?: string;

  @IsOptional()
  @IsDateString()
  manufacturingDate?: string | null;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsCurrency()
  mrp?: CurrencyAmountDto | null;
}
