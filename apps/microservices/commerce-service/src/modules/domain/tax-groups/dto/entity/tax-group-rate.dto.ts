import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import { isAfter, isBefore, parseISO, startOfToday } from 'date-fns';
import type { TaxBase, TaxCalculation, TaxGroupRate, TaxJurisdictionCheck, TaxMeasure } from '@/db/schema';

export class TaxGroupRateDto {
  id: string;
  taxGroupId: string;
  taxComponentId: string;
  taxComponentCode: string;
  taxComponentName: string;
  jurisdictionId: string | null;
  jurisdictionName: string | null;
  jurisdictionCheck: TaxJurisdictionCheck | null;
  calculation: TaxCalculation;
  rate: number | null;
  amount: CurrencyAmountDto | null;
  measure: TaxMeasure | null;
  base: TaxBase;
  sequence: number;
  validFrom: string;
  validTo: string | null;
  isCurrent: boolean;

  // Maps a rate with its component and jurisdiction names; the amount exists only on an amount-per-measure rate
  static from(
    entity: TaxGroupRate & { taxComponentCode: string; taxComponentName: string; jurisdictionName: string | null },
  ): TaxGroupRateDto {
    const today = startOfToday();
    const dto = new TaxGroupRateDto();
    dto.id = entity.id;
    dto.taxGroupId = entity.taxGroupId;
    dto.taxComponentId = entity.taxComponentId;
    dto.taxComponentCode = entity.taxComponentCode;
    dto.taxComponentName = entity.taxComponentName;
    dto.jurisdictionId = entity.jurisdictionId ?? null;
    dto.jurisdictionName = entity.jurisdictionName ?? null;
    dto.jurisdictionCheck = entity.jurisdictionCheck;
    dto.calculation = entity.calculation;
    dto.rate = entity.rate ?? null;
    dto.amount =
      entity.amount === null || entity.currencyCode === null
        ? null
        : CurrencyAmountDto.from(entity.amount, entity.currencyCode);
    dto.measure = entity.measure ?? null;
    dto.base = entity.base;
    dto.sequence = entity.sequence;
    dto.validFrom = entity.validFrom;
    dto.validTo = entity.validTo ?? null;
    dto.isCurrent =
      !isAfter(parseISO(entity.validFrom), today) &&
      (entity.validTo === null || !isBefore(parseISO(entity.validTo), today));
    return dto;
  }
}
