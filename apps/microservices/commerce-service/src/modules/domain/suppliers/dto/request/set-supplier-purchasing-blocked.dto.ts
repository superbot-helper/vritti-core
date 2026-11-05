import { IsBoolean, IsUUID } from 'class-validator';

export class SetSupplierPurchasingBlockedDto {
  @IsUUID('7')
  id: string;

  @IsBoolean()
  purchasingBlocked: boolean;
}
