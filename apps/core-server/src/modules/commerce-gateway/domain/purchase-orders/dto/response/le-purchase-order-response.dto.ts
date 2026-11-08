import { ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderResponseDto } from './purchase-order-response.dto';

export class LePurchaseOrderResponseDto extends PurchaseOrderResponseDto {
  @ApiPropertyOptional({ description: 'Site name (gateway-enriched, not sortable)', nullable: true })
  siteName: string | null;

  @ApiPropertyOptional({ description: 'Site code (gateway-enriched, not sortable)', nullable: true })
  siteCode: string | null;
}
