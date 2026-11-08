import { IsCode, Trim } from '@vritti/api-sdk/decorators';
import {
  IsBoolean,
  IsIn,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { type TaxJurisdictionLevel, taxJurisdictionLevelEnum } from '@/db/schema';

export class CreateTaxJurisdictionDto {
  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsCode()
  code: string;

  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsIn(taxJurisdictionLevelEnum.enumValues)
  level: TaxJurisdictionLevel;

  @IsOptional()
  @IsUUID('7')
  parentId?: string | null;

  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode: string;

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

  @IsBoolean()
  isActive: boolean;
}
