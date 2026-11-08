import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class ChangePurchaseOrderSupplierDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID('7')
  supplierId: string;

  @ApiPropertyOptional({
    description:
      "1 unit of the new currency in the legal entity's currency, when the new supplier moves the PO into a currency other than the legal entity's",
    example: 83.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  exchangeRate?: number;
}
