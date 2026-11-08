import { ApiPropertyOptional } from '@nestjs/swagger';
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

const REGISTRATION_TYPES = ['GSTIN', 'VAT', 'TIN', 'OTHER'] as const;

export class UpdateTaxRegistrationDto {
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

  @ApiPropertyOptional({ example: '36ABCDE1234F1Z5' })
  @IsOptional()
  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber?: string;

  @ApiPropertyOptional({ enum: REGISTRATION_TYPES })
  @IsOptional()
  @IsEnum(REGISTRATION_TYPES)
  registrationType?: (typeof REGISTRATION_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
