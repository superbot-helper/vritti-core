import { Trim } from '@vritti/api-sdk/decorators';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGoodsReceiptDto {
  @IsUUID('7')
  purchaseOrderId: string;

  @IsDateString()
  receivedDate: string;

  @Trim()
  @IsOptional()
  @IsString()
  notes?: string | null;
}
