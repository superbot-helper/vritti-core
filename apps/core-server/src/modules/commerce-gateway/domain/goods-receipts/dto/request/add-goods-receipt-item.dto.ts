import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class AddGoodsReceiptItemDto {
  @ApiProperty({ description: "Line of the receipt's purchase order the goods are counted against" })
  @IsUUID('7')
  purchaseOrderItemId: string;

  @ApiProperty({ description: 'Quantity received — paid and free together — in the line unit', example: 10 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  receivedQty: number;

  @ApiPropertyOptional({ description: 'Part of the received quantity rejected on arrival', example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  rejectedQuantity?: number;
}
