import { IsCurrencyCode } from '@vritti/api-sdk/money';
import { UpdateSupplierInvoiceLineDto } from './update-supplier-invoice-line.dto';

export class LeUpdateSupplierInvoiceLineDto extends UpdateSupplierInvoiceLineDto {
  @IsCurrencyCode()
  leCurrencyCode: string;
}
