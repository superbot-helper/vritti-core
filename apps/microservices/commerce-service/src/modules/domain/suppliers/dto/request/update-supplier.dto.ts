import { Trim } from '@vritti/api-sdk/decorators';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateSupplierDto {
  @IsUUID('7')
  id: string;

  @Trim({ nullify: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}
