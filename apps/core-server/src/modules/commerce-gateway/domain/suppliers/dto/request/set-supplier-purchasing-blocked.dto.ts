import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetSupplierPurchasingBlockedDto {
  @ApiProperty({ description: 'Stops new purchase orders and goods receipts from the supplier at every site' })
  @IsBoolean()
  purchasingBlocked: boolean;
}
