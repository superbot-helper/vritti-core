import { IsCurrencyCode } from '@vritti/api-sdk/money';
import { UpdateSupplierInvoiceDto } from './update-supplier-invoice.dto';

export class LeUpdateSupplierInvoiceDto extends UpdateSupplierInvoiceDto {
  @IsCurrencyCode()
  leCurrencyCode: string;
}
