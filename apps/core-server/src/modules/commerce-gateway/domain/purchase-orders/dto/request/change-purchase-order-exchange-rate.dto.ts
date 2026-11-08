import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class ChangePurchaseOrderExchangeRateDto {
  @ApiProperty({ description: "1 unit of the PO currency in the legal entity's currency", example: 83.5 })
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  exchangeRate: number;
}
