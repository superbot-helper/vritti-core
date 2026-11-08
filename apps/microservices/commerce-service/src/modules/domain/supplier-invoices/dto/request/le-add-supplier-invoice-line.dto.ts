import { IsCurrencyCode } from '@vritti/api-sdk/money';
import { AddSupplierInvoiceLineDto } from './add-supplier-invoice-line.dto';

export class LeAddSupplierInvoiceLineDto extends AddSupplierInvoiceLineDto {
  @IsCurrencyCode()
  leCurrencyCode: string;
}
