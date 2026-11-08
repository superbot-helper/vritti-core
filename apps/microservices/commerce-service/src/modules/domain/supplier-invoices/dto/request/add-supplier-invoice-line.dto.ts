import { IsUUID } from 'class-validator';
import { SupplierInvoiceLineFieldsDto } from './supplier-invoice-line-fields.dto';

export class AddSupplierInvoiceLineDto extends SupplierInvoiceLineFieldsDto {
  @IsUUID('7')
  supplierInvoiceId: string;
}
