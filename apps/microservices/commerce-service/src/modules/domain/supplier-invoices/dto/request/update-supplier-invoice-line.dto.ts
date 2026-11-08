import { IsUUID } from 'class-validator';
import { SupplierInvoiceLineFieldsDto } from './supplier-invoice-line-fields.dto';

export class UpdateSupplierInvoiceLineDto extends SupplierInvoiceLineFieldsDto {
  @IsUUID('7')
  id: string;

  @IsUUID('7')
  supplierInvoiceId: string;
}
