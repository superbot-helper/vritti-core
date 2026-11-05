import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SupplierItemPricesTableQueryDto {
  @ApiProperty({ description: 'Site to read the prices at' })
  @IsUUID('7')
  site: string;
}
