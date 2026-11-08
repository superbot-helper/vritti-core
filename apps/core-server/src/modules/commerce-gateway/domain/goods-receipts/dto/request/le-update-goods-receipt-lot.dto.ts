import { ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';
import { LE_INVENTORY_ITEMS } from '@vritti/commerce-permissions/inventory-items';
import { IsOptional } from 'class-validator';
import { FieldPermission } from '@/rbac/decorators';
import { UpdateGoodsReceiptLotDto } from './update-goods-receipt-lot.dto';

export class LeUpdateGoodsReceiptLotDto extends UpdateGoodsReceiptLotDto {
  @FieldPermission([LE_INVENTORY_ITEMS.mrp.edit])
  @ApiPropertyOptional({
    type: CurrencyAmountDto,
    description: "Printed MRP per primary unit (the legal entity's currency)",
    nullable: true,
  })
  @IsOptional()
  @IsCurrency()
  declare mrp?: CurrencyAmountDto | null;
}
