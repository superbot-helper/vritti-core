import { Trim } from '@vritti/api-sdk/decorators';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSupplierInvoiceDto {
  @IsUUID('7')
  purchaseOrderId: string;

  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  invoiceNumber: string;

  @IsDateString()
  invoiceDate: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
