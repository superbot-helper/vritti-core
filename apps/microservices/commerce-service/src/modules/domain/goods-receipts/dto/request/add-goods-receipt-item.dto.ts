import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class AddGoodsReceiptItemDto {
  @IsUUID('7')
  goodsReceiptId: string;

  @IsUUID('7')
  purchaseOrderItemId: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  receivedQty: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  rejectedQuantity?: number;
}
