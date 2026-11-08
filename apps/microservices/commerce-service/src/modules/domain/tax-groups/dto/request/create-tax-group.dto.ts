import { IsCode, Trim } from '@vritti/api-sdk/decorators';
import {
  IsBoolean,
  IsIn,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUppercase,
  MaxLength,
} from 'class-validator';
import { type TaxTreatment, taxTreatmentEnum } from '@/db/schema';

export class CreateTaxGroupDto {
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode: string;

  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsCode()
  code: string;

  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsIn(taxTreatmentEnum.enumValues)
  treatment: TaxTreatment;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  legalText?: string | null;

  @IsBoolean()
  isActive: boolean;
}
