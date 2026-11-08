import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoodsReceiptTreeNodeResponseDto {
  @ApiProperty({ description: 'Item ID for items, lot ID for lots, line ID for lines' })
  id: string;

  @ApiProperty({ description: 'Item name for items, lot number for lots, location name for lines' })
  name: string;

  @ApiProperty({ enum: ['item', 'lot', 'line'] })
  kind: 'item' | 'lot' | 'line';

  @ApiProperty({ description: 'True when the node is fully distributed (items, lots) or has all its serials (lines)' })
  balanced: boolean;

  @ApiProperty({
    description: 'Progress label: distributed/accepted for items, quantity for lots, serials/quantity for lines',
  })
  badge: string;

  @ApiPropertyOptional({
    description: 'Lots or lines below the node, by how the item is tracked',
    type: () => GoodsReceiptTreeNodeResponseDto,
    isArray: true,
  })
  children?: GoodsReceiptTreeNodeResponseDto[];
}
