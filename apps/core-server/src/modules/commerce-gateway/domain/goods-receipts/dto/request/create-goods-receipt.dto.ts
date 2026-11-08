import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGoodsReceiptDto {
  @ApiProperty({
    description: 'Confirmed or partially received purchase order the goods arrive against; supplier and site are its',
  })
  @IsUUID('7')
  purchaseOrderId: string;

  @ApiProperty({ description: 'Date the goods were received (ISO string)', example: '2026-04-10' })
  @IsDateString()
  receivedDate: string;

  @Trim()
  @ApiPropertyOptional({ description: 'Notes', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}
