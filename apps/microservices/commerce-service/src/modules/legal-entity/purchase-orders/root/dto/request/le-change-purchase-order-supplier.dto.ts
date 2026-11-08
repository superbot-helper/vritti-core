import { ChangePurchaseOrderSupplierDto } from '@domain/purchase-orders/dto/request/change-purchase-order-supplier.dto';
import { IsCurrencyCode } from '@vritti/api-sdk/money';

export class LeChangePurchaseOrderSupplierDto extends ChangePurchaseOrderSupplierDto {
  @IsCurrencyCode()
  leCurrencyCode: string;
}
