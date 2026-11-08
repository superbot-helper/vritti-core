import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';

export class GoodsReceiptPurchaseOrderResponseDto {
  @ApiProperty({ description: 'Purchase order ID' })
  id: string;

  @ApiProperty({ description: 'PO number' })
  poNumber: string;

  @ApiProperty({ description: 'Order date (YYYY-MM-DD)' })
  orderDate: string;

  @ApiPropertyOptional({ description: 'Expected-by date/time', nullable: true })
  expectedBy: string | null;

  @ApiProperty({ type: CurrencyAmountDto, description: 'PO total in the PO currency' })
  totalAmount: CurrencyAmountDto;
}

export class GoodsReceiptResponseDto {
  @ApiProperty({ description: 'Goods receipt ID' })
  id: string;

  @ApiProperty({ description: 'GR number', example: 'GR-202611-0001' })
  grNumber: string;

  @ApiProperty({ description: 'Legal entity the receipt belongs to' })
  legalEntityId: string;

  @ApiProperty({ description: "Site the goods were received at — the purchase order's site" })
  siteId: string;

  @ApiProperty({ description: "Supplier ID — the purchase order's supplier" })
  supplierId: string;

  @ApiProperty({ description: 'Supplier name' })
  supplierName: string;

  @ApiProperty({ description: 'Receipt status', enum: ['DRAFT', 'PUBLISHED'] })
  status: string;

  @ApiProperty({
    description: 'True for a draft whose every item is fully distributed to balanced lines — the Publish gate',
  })
  isPublishable: boolean;

  @ApiProperty({ description: 'Number of items counted on the receipt' })
  itemCount: number;

  @ApiProperty({ description: 'Purchase order the goods were received against' })
  purchaseOrderId: string;

  @ApiProperty({ type: GoodsReceiptPurchaseOrderResponseDto })
  po: GoodsReceiptPurchaseOrderResponseDto;

  @ApiProperty({ description: 'Date the goods were received' })
  receivedDate: string;

  @ApiPropertyOptional({ description: 'Notes', nullable: true })
  notes: string | null;

  @ApiPropertyOptional({ description: 'ISO timestamp of publishing', nullable: true })
  publishedAt: string | null;

  @ApiProperty({ description: 'ISO timestamp of creation' })
  createdAt: string;
}
