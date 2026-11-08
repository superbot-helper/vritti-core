import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto, type TableViewState } from '@vritti/api-sdk/data-table';
import { InventoryItemMrpResponseDto } from './inventory-item-mrp-response.dto';

export class InventoryItemMrpTableResponseDto extends TableResponseDto<InventoryItemMrpResponseDto> {
  @ApiProperty({ type: [InventoryItemMrpResponseDto] })
  declare result: InventoryItemMrpResponseDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty()
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
