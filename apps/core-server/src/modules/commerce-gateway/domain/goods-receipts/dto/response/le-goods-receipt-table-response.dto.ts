import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto, type TableViewState } from '@vritti/api-sdk/data-table';
import { LeGoodsReceiptResponseDto } from './le-goods-receipt-response.dto';

export class LeGoodsReceiptTableResponseDto extends TableResponseDto<LeGoodsReceiptResponseDto> {
  @ApiProperty({ type: [LeGoodsReceiptResponseDto] })
  declare result: LeGoodsReceiptResponseDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
