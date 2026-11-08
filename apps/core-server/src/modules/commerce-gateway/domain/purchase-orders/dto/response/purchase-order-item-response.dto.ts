import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';

export class PurchaseOrderItemResponseDto {
  @ApiProperty({ description: 'Purchase order item ID' })
  id: string;

  @ApiProperty({ description: 'Purchase order ID' })
  purchaseOrderId: string;

  @ApiProperty({ description: 'Inventory item ID' })
  inventoryItemId: string;

  @ApiProperty({ description: 'Inventory item name' })
  inventoryItemName: string;

  @ApiProperty({ description: 'Unit the line is ordered in' })
  uomId: string;

  @ApiPropertyOptional({ description: 'Symbol of the unit the line is ordered in', nullable: true })
  orderUomSymbol: string | null;

  @ApiProperty({ description: 'Ordered quantity in the line unit' })
  uomQty: number;

  @ApiProperty({ description: 'Free quantity the scheme gives on the whole ordered quantity, in the line unit' })
  expectedFreeQty: number;

  @ApiProperty({ description: 'Accepted (received less rejected) on published goods receipts, in the line unit' })
  receivedQty: number;

  @ApiProperty({ description: "Ordered quantity in the item's primary unit" })
  primaryUomQty: number;

  @ApiPropertyOptional({ description: "Symbol of the item's primary unit", nullable: true })
  primaryUomSymbol: string | null;

  @ApiProperty({ description: 'Line currency code (ISO 4217) — the PO currency' })
  currencyCode: string;

  @ApiProperty({ type: CurrencyAmountDto, description: 'Unit price in the PO currency' })
  unitPrice: CurrencyAmountDto;

  @ApiProperty({ type: CurrencyAmountDto, description: "Line total spread over the item's primary unit" })
  primaryUomUnitPrice: CurrencyAmountDto;

  @ApiProperty({ type: CurrencyAmountDto, description: 'Line total in the PO currency' })
  totalPrice: CurrencyAmountDto;

  @ApiPropertyOptional({
    type: CurrencyAmountDto,
    nullable: true,
    description:
      "The supplier item's own price when it is in another currency than the PO; unitPrice is its conversion",
  })
  sourceUnitPrice: CurrencyAmountDto | null;

  @ApiPropertyOptional({ description: 'Free-goods scheme buy qty (e.g. 9 in "9+1").', nullable: true })
  schemeBuyQty: number | null;

  @ApiPropertyOptional({ description: 'Free-goods scheme free qty (e.g. 1 in "9+1").', nullable: true })
  schemeFreeQty: number | null;

  @ApiProperty({ description: 'Whether a free-goods scheme applies.' })
  hasScheme: boolean;
}
