import { UpdateGoodsReceiptLotDto } from '@domain/goods-receipt-lots/dto/request/update-goods-receipt-lot.dto';
import { IsCurrencyCode } from '@vritti/api-sdk/money';

export class LeUpdateGoodsReceiptLotDto extends UpdateGoodsReceiptLotDto {
  @IsCurrencyCode()
  leCurrencyCode: string;
}
