import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetSupplierEnrollmentActiveDto {
  @ApiProperty({ description: "Whether the supplier's enrollment at the site is active", example: true })
  @IsBoolean()
  isActive: boolean;
}
