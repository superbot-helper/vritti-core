import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto, type TableViewState } from '@vritti/api-sdk/data-table';
import { TaxClassMappingResponseDto } from './tax-class-mapping-response.dto';

export class TaxClassMappingTableResponseDto extends TableResponseDto<TaxClassMappingResponseDto> {
  @ApiProperty({ type: [TaxClassMappingResponseDto] })
  declare result: TaxClassMappingResponseDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional({ nullable: true })
  declare activeViewId: string | null;
}
