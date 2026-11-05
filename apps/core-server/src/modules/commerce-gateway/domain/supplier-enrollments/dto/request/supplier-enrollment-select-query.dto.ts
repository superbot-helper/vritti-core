import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/select';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import {
  SUPPLIER_ENROLLMENT_STATUSES,
  type SupplierEnrollmentStatus,
} from '../response/supplier-enrollment-row-response.dto';

export class SupplierEnrollmentSelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({
    description: "Only suppliers with this enrollment status at the session's site",
    enum: SUPPLIER_ENROLLMENT_STATUSES,
  })
  @IsOptional()
  @IsIn(SUPPLIER_ENROLLMENT_STATUSES)
  enrollmentStatus?: SupplierEnrollmentStatus;

  @ApiPropertyOptional({
    description: "Only suppliers active supplier-wide whose enrollment at the session's site, if any, is active",
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activeOnly?: boolean;
}
