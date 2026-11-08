import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class SupplierInvoiceLineDto {
  @ApiProperty({ description: 'Order line billed; the item and unit come from it and every quantity is in its unit' })
  @IsUUID('7')
  purchaseOrderItemId: string;

  @Trim()
  @ApiPropertyOptional({ description: 'Batch number on the invoice', nullable: true, example: 'B2611A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lotNumber?: string | null;

  @ApiPropertyOptional({ description: 'Batch expiry date on the invoice', nullable: true, example: '2028-06-30' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;

  @ApiPropertyOptional({ type: CurrencyAmountDto, description: 'MRP printed on the pack', nullable: true })
  @IsOptional()
  @IsCurrency()
  mrp?: CurrencyAmountDto | null;

  @ApiProperty({ description: 'Quantity billed', example: 20 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  billedQty: number;

  @ApiProperty({ description: 'Quantity supplied free', example: 2 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  freeQty: number;

  @ApiProperty({ type: CurrencyAmountDto, description: 'Billed price per unit, in the invoice currency' })
  @IsCurrency()
  unitPrice: CurrencyAmountDto;

  @ApiPropertyOptional({ type: CurrencyAmountDto, description: 'Discount on the line' })
  @IsOptional()
  @IsCurrency()
  discountAmount?: CurrencyAmountDto;

  @ApiPropertyOptional({ type: CurrencyAmountDto, description: 'Tax on the line' })
  @IsOptional()
  @IsCurrency()
  taxAmount?: CurrencyAmountDto;
}
