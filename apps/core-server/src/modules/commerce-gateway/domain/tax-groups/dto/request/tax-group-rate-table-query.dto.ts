import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID, Matches } from 'class-validator';

export class TaxGroupRateTableQueryDto {
  @ApiPropertyOptional({
    description:
      'Jurisdiction (state) to list only the rates charged there: its own rates, and the whole-country rates of every component it has none for',
  })
  @IsOptional()
  @IsUUID('7')
  jurisdiction?: string;

  @ApiPropertyOptional({ description: 'Day (YYYY-MM-DD) to list only the rates in force on it', example: '2025-09-22' })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'asOf must be YYYY-MM-DD' })
  asOf?: string;
}
