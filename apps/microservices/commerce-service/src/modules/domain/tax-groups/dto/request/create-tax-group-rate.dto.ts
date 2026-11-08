import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';
import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsUUID, Matches, Max, Min } from 'class-validator';
import {
  type TaxBase,
  type TaxCalculation,
  type TaxJurisdictionCheck,
  type TaxMeasure,
  taxBaseEnum,
  taxCalculationEnum,
  taxJurisdictionCheckEnum,
  taxMeasureEnum,
} from '@/db/schema';

export class CreateTaxGroupRateDto {
  @IsUUID('7')
  taxGroupId: string;

  @IsUUID('7')
  taxComponentId: string;

  @IsOptional()
  @IsUUID('7')
  jurisdictionId?: string | null;

  @IsOptional()
  @IsIn(taxJurisdictionCheckEnum.enumValues)
  jurisdictionCheck?: TaxJurisdictionCheck | null;

  @IsIn(taxCalculationEnum.enumValues)
  calculation: TaxCalculation;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'Rate allows up to 4 decimal places' })
  @Min(0)
  @Max(999.9999)
  rate?: number | null;

  @IsOptional()
  @IsCurrency()
  amount?: CurrencyAmountDto | null;

  @IsOptional()
  @IsIn(taxMeasureEnum.enumValues)
  measure?: TaxMeasure | null;

  @IsIn(taxBaseEnum.enumValues)
  base: TaxBase;

  @IsInt()
  @Min(0)
  sequence: number;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'validFrom must be YYYY-MM-DD' })
  validFrom: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'validTo must be YYYY-MM-DD' })
  validTo?: string | null;
}
