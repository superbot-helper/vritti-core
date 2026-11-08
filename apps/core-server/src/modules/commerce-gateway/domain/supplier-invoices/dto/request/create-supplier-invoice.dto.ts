import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreatePurchaseOrderInvoiceDto } from './create-purchase-order-invoice.dto';

export class CreateSupplierInvoiceDto extends CreatePurchaseOrderInvoiceDto {
  @ApiProperty({
    description: 'Purchase order the invoice bills; supplier, site, currency and exchange rate come from it',
  })
  @IsUUID('7')
  purchaseOrderId: string;
}
