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

export class CreateTaxRegistrationDto {
  // Absent on the VAP path — the column defaults to the workspace entity, so a body value cannot point a registration
  // at someone else's legal entity
  @IsOptional()
  @IsUUID('7')
  legalEntityId?: string;

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

  @IsEnum(TaxRegistrationTypeValues)
  registrationType: keyof typeof TaxRegistrationTypeValues;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
