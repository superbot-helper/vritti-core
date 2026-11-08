import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class UpdateGoodsReceiptItemDto {
  @IsUUID('7')
  goodsReceiptId: string;

  @IsUUID('7')
  itemId: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  receivedQty?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  rejectedQuantity?: number;
}
