import { ChangePurchaseOrderExchangeRateDto } from '@domain/purchase-orders/dto/request/change-purchase-order-exchange-rate.dto';
import { IsCurrencyCode } from '@vritti/api-sdk/money';

export class LeChangePurchaseOrderExchangeRateDto extends ChangePurchaseOrderExchangeRateDto {
  @IsCurrencyCode()
  leCurrencyCode: string;
}
