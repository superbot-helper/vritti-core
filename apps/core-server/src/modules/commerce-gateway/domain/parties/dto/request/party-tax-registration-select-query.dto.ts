import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PartySelectQueryDto } from './party-select-query.dto';

export class PartyTaxRegistrationSelectQueryDto extends PartySelectQueryDto {
  @ApiPropertyOptional({ description: 'Only active sales-tax registrations (GSTIN, VAT), for enrollment pickers' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  salesTaxOnly?: boolean;
}
