import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/select';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  SUPPLIER_ENROLLMENT_SITE_STATUSES,
  type SupplierEnrollmentSiteStatus,
} from '../response/supplier-enrollment-row-response.dto';

export class SupplierEnrollmentSitesSelectQueryDto extends SelectOptionsQueryDto {
  @ApiProperty({ description: 'Supplier whose enrollments list the sites' })
  @IsUUID('7')
  supplierId: string;

  @ApiPropertyOptional({
    description:
      "Which of the legal entity's sites to list: the enrolled ones (default), the not-enrolled ones, or all",
    enum: SUPPLIER_ENROLLMENT_SITE_STATUSES,
  })
  @IsOptional()
  @IsIn(SUPPLIER_ENROLLMENT_SITE_STATUSES)
  enrollmentStatus?: SupplierEnrollmentSiteStatus;

  @ApiPropertyOptional({ description: 'Only sites where the enrollment and the supplier are both active' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activeOnly?: boolean;
}
