import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateTaxRegistrationDto {
  @ApiPropertyOptional({ description: 'Cloud names the entity; VAP takes it from the workspace header' })
  @IsOptional()
  @IsUUID('7')
  legalEntityId?: string;

  @ApiProperty({ description: 'Uppercase ISO 3166-1 alpha-2 country the registration is issued in', example: 'IN' })
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode: string;

  @ApiPropertyOptional({
    description:
      'Jurisdiction in that country the registration is issued in — required (a state) for a GSTIN; omit for a national registration such as a VAT number',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('7')
  jurisdictionId?: string | null;

  @ApiProperty({ example: '36ABCDE1234F1Z5' })
  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber: string;

  @ApiProperty({ enum: REGISTRATION_TYPES })
  @IsEnum(REGISTRATION_TYPES)
  registrationType: (typeof REGISTRATION_TYPES)[number];

  @ApiPropertyOptional({ description: 'At most one per legal entity; setting this clears the others' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
