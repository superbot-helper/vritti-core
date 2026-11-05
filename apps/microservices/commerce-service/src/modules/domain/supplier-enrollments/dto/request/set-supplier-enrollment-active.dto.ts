import { IsBoolean, IsUUID } from 'class-validator';

export class SetSupplierEnrollmentActiveDto {
  @IsUUID('7')
  supplierId: string;

  @IsUUID('7')
  siteId: string;

  @IsBoolean()
  isActive: boolean;
}
