import { SelectOptionsQueryDto } from '@vritti/api-sdk/select';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { type SupplierEnrollmentStatus, SupplierEnrollmentStatusValues } from '../entity/supplier-enrollment-row.dto';

export class SupplierEnrollmentSelectQueryDto extends SelectOptionsQueryDto {
  @IsOptional()
  @IsIn(Object.values(SupplierEnrollmentStatusValues))
  enrollmentStatus?: SupplierEnrollmentStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activeOnly?: boolean;
}
