import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSupplierDto {
  @Trim({ nullify: false })
  @ApiPropertyOptional({ description: 'Updated supplier code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @Trim()
  @ApiPropertyOptional({ description: 'Updated notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}
