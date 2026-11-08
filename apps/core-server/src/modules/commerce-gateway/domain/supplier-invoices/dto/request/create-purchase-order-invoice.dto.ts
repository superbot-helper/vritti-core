import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePurchaseOrderInvoiceDto {
  @Trim({ nullify: false })
  @ApiProperty({ description: "The supplier's invoice number, unique per supplier", example: 'SBD/INV/2611/0042' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  invoiceNumber: string;

  @ApiProperty({ description: 'Date on the invoice', example: '2026-11-07' })
  @IsDateString()
  invoiceDate: string;

  @Trim()
  @ApiPropertyOptional({ description: 'Internal notes', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
