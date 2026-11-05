import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PartySelectQueryDto } from './party-select-query.dto';

export class PartyTaxRegistrationSelectQueryDto extends PartySelectQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  salesTaxOnly?: boolean;
}
