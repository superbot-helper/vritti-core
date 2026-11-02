import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/select';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class PaymentTermsSelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({
    description: 'When true, unpublished (draft) terms are returned too — for navigation, not picking',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  allowUnpublished?: boolean;
}
