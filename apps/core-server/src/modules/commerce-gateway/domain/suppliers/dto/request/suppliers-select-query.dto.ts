import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/select';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class SuppliersSelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({ description: 'Only active suppliers' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activeOnly?: boolean;
}
