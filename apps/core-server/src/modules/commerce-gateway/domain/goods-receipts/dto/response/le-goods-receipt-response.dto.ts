import { ApiPropertyOptional } from '@nestjs/swagger';
import { GoodsReceiptResponseDto } from './goods-receipt-response.dto';

export class LeGoodsReceiptResponseDto extends GoodsReceiptResponseDto {
  @ApiPropertyOptional({ description: 'Site name (gateway-enriched, not sortable)', nullable: true })
  siteName: string | null;

  @ApiPropertyOptional({ description: 'Site code (gateway-enriched, not sortable)', nullable: true })
  siteCode: string | null;
}
