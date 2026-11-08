import { ApiProperty } from '@nestjs/swagger';

export class GoodsReceiptLineItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() goodsReceiptLineId: string;
  @ApiProperty() serialNumber: string;
  @ApiProperty() createdAt: string;
}
