import { AddGoodsReceiptLotDto } from '@domain/goods-receipt-lots/dto/request/add-goods-receipt-lot.dto';
import { IsCurrencyCode } from '@vritti/api-sdk/money';

export class LeAddGoodsReceiptLotDto extends AddGoodsReceiptLotDto {
  @IsCurrencyCode()
  leCurrencyCode: string;
}
