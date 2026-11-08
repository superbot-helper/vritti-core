import { ApiProperty } from '@nestjs/swagger';

export class PurchaseOrderInvoiceSummaryResponseDto {
  @ApiProperty({ description: 'Invoices billing the order, cancelled ones excluded' })
  invoiceCount: number;

  @ApiProperty({ description: 'Of those, the invoices with at least one failed match check' })
  flaggedInvoiceCount: number;

  @ApiProperty({ description: "Quantity billed over the order's lines" })
  billedQty: number;

  @ApiProperty({ description: 'Quantity billed as a percentage of the quantity ordered', example: 62.5 })
  billedPercent: number;
}
