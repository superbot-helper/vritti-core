import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdatePurchaseOrderStatusDto {
  @ApiProperty({
    description: 'Next status in the manual workflow; receipt statuses follow published goods receipts instead',
    enum: ['SENT', 'CONFIRMED', 'CLOSED', 'CANCELLED'],
  })
  @IsIn(['SENT', 'CONFIRMED', 'CLOSED', 'CANCELLED'])
  status: 'SENT' | 'CONFIRMED' | 'CLOSED' | 'CANCELLED';
}
