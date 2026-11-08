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

export class CreatePersonRegistrationDto {
  @IsUUID('7')
  personId: string;

  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode: string;

  @IsOptional()
  @IsUUID('7')
  jurisdictionId?: string | null;

  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber: string;

  @IsIn(taxRegistrationTypeEnum.enumValues)
  registrationType: TaxRegistrationType;

  @IsOptional()
  @IsIn(taxRegistrationSchemeEnum.enumValues)
  scheme?: TaxRegistrationScheme;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
