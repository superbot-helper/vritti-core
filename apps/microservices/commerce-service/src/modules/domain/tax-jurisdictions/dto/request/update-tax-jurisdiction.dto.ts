import { Trim } from '@vritti/api-sdk/decorators';
import {
  IsBoolean,
  IsIn,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { type TaxJurisdictionLevel, taxJurisdictionLevelEnum } from '@/db/schema';

export class UpdateTaxJurisdictionDto {
  @IsUUID('7')
  id: string;

  @Trim({ nullify: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(taxJurisdictionLevelEnum.enumValues)
  level?: TaxJurisdictionLevel;

  @IsOptional()
  @IsUUID('7')
  parentId?: string | null;

  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @Length(1, 10)
  regionCode?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxUnion?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
