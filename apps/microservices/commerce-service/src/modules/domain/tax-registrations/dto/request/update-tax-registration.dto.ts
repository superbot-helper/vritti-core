import { Trim } from '@vritti/api-sdk/decorators';
import {
  IsBoolean,
  IsEnum,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TaxRegistrationTypeValues } from '@/db/schema';

export class UpdateTaxRegistrationDto {
  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode?: string;

  @IsOptional()
  @IsUUID('7')
  jurisdictionId?: string | null;

  @IsOptional()
  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber?: string;

  @IsOptional()
  @IsEnum(TaxRegistrationTypeValues)
  registrationType?: keyof typeof TaxRegistrationTypeValues;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
