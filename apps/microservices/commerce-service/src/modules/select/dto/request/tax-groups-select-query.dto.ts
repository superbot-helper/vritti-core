import { SelectOptionsQueryDto } from '@vritti/api-sdk/select';
import { IsISO31661Alpha2, IsOptional, IsUppercase } from 'class-validator';

export class TaxGroupsSelectQueryDto extends SelectOptionsQueryDto {
  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  country?: string;
}
