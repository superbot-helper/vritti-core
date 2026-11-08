import { ApiPropertyOptional } from '@nestjs/swagger';
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

const TAX_REGISTRATION_TYPES = ['GSTIN', 'VAT', 'TIN', 'OTHER'] as const;
type TaxRegistrationTypeValue = (typeof TAX_REGISTRATION_TYPES)[number];
const TAX_REGISTRATION_SCHEMES = ['REGULAR', 'COMPOSITION', 'SEZ'] as const;
type TaxRegistrationSchemeValue = (typeof TAX_REGISTRATION_SCHEMES)[number];

export class UpdatePersonRegistrationDto {
  @ApiPropertyOptional({
    description: 'Uppercase ISO 3166-1 alpha-2 country the registration is issued in',
    example: 'IN',
  })
  @IsOptional()
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Jurisdiction in that country; null makes the registration national (not allowed for a GSTIN)',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('7')
  jurisdictionId?: string | null;

  @Trim({ nullify: false })
  @ApiPropertyOptional({ description: 'Registration number' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber?: string;

  @ApiPropertyOptional({ description: 'Registration type', enum: TAX_REGISTRATION_TYPES })
  @IsOptional()
  @IsIn(TAX_REGISTRATION_TYPES)
  registrationType?: TaxRegistrationTypeValue;

  @ApiPropertyOptional({
    description: 'How the party is registered — regular, composition scheme or SEZ unit',
    enum: TAX_REGISTRATION_SCHEMES,
    default: 'REGULAR',
  })
  @IsOptional()
  @IsIn(TAX_REGISTRATION_SCHEMES)
  scheme?: TaxRegistrationSchemeValue;

  @ApiPropertyOptional({ description: 'Whether this is the primary registration' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
