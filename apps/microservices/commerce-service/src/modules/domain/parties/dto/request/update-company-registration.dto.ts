import { Trim } from '@vritti/api-sdk/decorators';
import {
  IsBoolean,
  IsIn,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  type TaxRegistrationScheme,
  type TaxRegistrationType,
  taxRegistrationSchemeEnum,
  taxRegistrationTypeEnum,
} from '@/db/schema';

export class UpdateCompanyRegistrationDto {
  @IsUUID('7')
  id: string;

  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode?: string;

  @IsOptional()
  @IsUUID('7')
  jurisdictionId?: string | null;

  @Trim({ nullify: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber?: string;

  @IsOptional()
  @IsIn(taxRegistrationTypeEnum.enumValues)
  registrationType?: TaxRegistrationType;

  @IsOptional()
  @IsIn(taxRegistrationSchemeEnum.enumValues)
  scheme?: TaxRegistrationScheme;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
