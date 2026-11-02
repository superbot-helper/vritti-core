import { Trim } from '@vritti/api-sdk/decorators';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateSupplierDto {
  @IsUUID('7')
  id: string;

  @Trim({ nullify: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @IsOptional()
  @IsUUID('7')
  defaultPaymentTermId?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;

  @IsOptional()
  @IsBoolean()
  purchasingBlocked?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentBlocked?: boolean;
}
