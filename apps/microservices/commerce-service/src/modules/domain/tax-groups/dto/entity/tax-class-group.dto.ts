import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import { isAfter, isBefore, parseISO, startOfToday } from 'date-fns';
import type { TaxClassGroup } from '@/db/schema';

export class TaxClassGroupDto {
  id: string;
  countryCode: string;
  taxClassId: string;
  taxClassCode: string;
  taxClassName: string;
  taxGroupId: string;
  taxGroupCode: string;
  taxGroupName: string;
  maxUnitPrice: CurrencyAmountDto | null;
  validFrom: string;
  validTo: string | null;
  isCurrent: boolean;

  // Maps a class mapping with its class and group names; the price limit is optional
  static from(
    entity: TaxClassGroup & { taxClassCode: string; taxClassName: string; taxGroupCode: string; taxGroupName: string },
  ): TaxClassGroupDto {
    const today = startOfToday();
    const dto = new TaxClassGroupDto();
    dto.id = entity.id;
    dto.countryCode = entity.countryCode;
    dto.taxClassId = entity.taxClassId;
    dto.taxClassCode = entity.taxClassCode;
    dto.taxClassName = entity.taxClassName;
    dto.taxGroupId = entity.taxGroupId;
    dto.taxGroupCode = entity.taxGroupCode;
    dto.taxGroupName = entity.taxGroupName;
    dto.maxUnitPrice =
      entity.maxUnitPrice === null || entity.currencyCode === null
        ? null
        : CurrencyAmountDto.from(entity.maxUnitPrice, entity.currencyCode);
    dto.validFrom = entity.validFrom;
    dto.validTo = entity.validTo ?? null;
    dto.isCurrent =
      !isAfter(parseISO(entity.validFrom), today) &&
      (entity.validTo === null || !isBefore(parseISO(entity.validTo), today));
    return dto;
  }
}
