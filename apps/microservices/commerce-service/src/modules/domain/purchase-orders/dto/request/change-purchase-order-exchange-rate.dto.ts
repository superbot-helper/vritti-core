import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class ChangePurchaseOrderExchangeRateDto {
  @IsUUID('7')
  id: string;

  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  exchangeRate: number;
}
