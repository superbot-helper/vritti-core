import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class UpdateGoodsReceiptItemDto {
  @ApiPropertyOptional({ description: 'Quantity received — paid and free together — in the line unit' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  receivedQty?: number;

  @ApiPropertyOptional({ description: 'Part of the received quantity rejected on arrival' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  rejectedQuantity?: number;
}
