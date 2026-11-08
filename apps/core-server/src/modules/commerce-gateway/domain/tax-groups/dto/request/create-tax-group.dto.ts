import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { TAX_TREATMENTS } from '../response/tax-group-response.dto';

export class CreateTaxGroupDto {
  @ApiProperty({
    description: 'Uppercase ISO 3166-1 alpha-2 country whose tax law the group belongs to; fixed after creation',
    example: 'IN',
  })
  @IsISO31661Alpha2()
  @IsUppercase()
  countryCode: string;

  @ApiProperty({ description: 'Code, unique within the country', example: 'gst-5' })
  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsCode()
  code: string;

  @ApiProperty({ description: 'Tax group name', example: 'GST 5%' })
  @Trim({ nullify: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'How supplies in the group are treated', enum: TAX_TREATMENTS })
  @IsIn(TAX_TREATMENTS)
  treatment: (typeof TAX_TREATMENTS)[number];

  @ApiPropertyOptional({ description: 'Text printed on documents, e.g. an exemption reason', nullable: true })
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  legalText?: string | null;

  @ApiProperty({ description: 'Whether the group can be picked' })
  @IsBoolean()
  isActive: boolean;
}
