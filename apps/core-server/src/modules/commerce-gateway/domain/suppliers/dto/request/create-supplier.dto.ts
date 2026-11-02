import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayIncludesField, Trim } from '@vritti/api-sdk/decorators';
import { IsCurrencyCode } from '@vritti/api-sdk/money';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ description: 'The party (COMPANY or PERSON) this supplier represents' })
  @IsUUID('7')
  partyId: string;

  @Trim({ nullify: false })
  @ApiProperty({ description: 'Unique supplier code', example: 'SUP-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: 'Default supplier currency code (ISO 4217)', example: 'INR' })
  @IsNotEmpty()
  @IsCurrencyCode()
  currencyCode: string;

  @ApiProperty({
    type: [String],
    description: 'Every currency the supplier trades in; must include the default currency',
    example: ['INR', 'USD'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsCurrencyCode({ each: true })
  @ArrayIncludesField('currencyCode', { message: 'Must include the default currency' })
  currencyCodes: string[];

  @ApiProperty({ description: 'Payment term new site enrollments start from' })
  @IsUUID('7')
  defaultPaymentTermId: string;

  @Trim({ nullify: true })
  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;

  @ApiProperty({ description: 'Block new purchase orders for this supplier', example: false })
  @IsBoolean()
  purchasingBlocked: boolean;

  @ApiProperty({ description: 'Block payments to this supplier', example: false })
  @IsBoolean()
  paymentBlocked: boolean;

  @Trim()
  @ApiPropertyOptional({ description: 'Email for sending purchase orders', example: 'orders@acme.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  orderEmail?: string | null;

  @Trim()
  @ApiPropertyOptional({ description: 'Phone for order communication', example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  orderPhone?: string | null;

  @ApiProperty({ description: 'Whether supplier is active', example: true })
  @IsBoolean()
  isActive: boolean;
}
