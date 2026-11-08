import type { TaxClassGroup } from '@/db/schema';
import { TaxClassGroupDto } from './tax-class-group.dto';

export class TaxClassMappingDto {
  taxClassId: string;
  taxClassCode: string;
  taxClassName: string;
  countryCode: string;
  mapping: TaxClassGroupDto | null;

  // Maps a tax class with the mapping valid today in the country, or null when the class is unmapped there
  static from(row: {
    taxClassId: string;
    taxClassCode: string;
    taxClassName: string;
    countryCode: string;
    mapping: TaxClassGroup | null;
    taxGroup: { code: string; name: string } | null;
  }): TaxClassMappingDto {
    const dto = new TaxClassMappingDto();
    dto.taxClassId = row.taxClassId;
    dto.taxClassCode = row.taxClassCode;
    dto.taxClassName = row.taxClassName;
    dto.countryCode = row.countryCode;
    dto.mapping =
      row.mapping && row.taxGroup
        ? TaxClassGroupDto.from({
            ...row.mapping,
            taxClassCode: row.taxClassCode,
            taxClassName: row.taxClassName,
            taxGroupCode: row.taxGroup.code,
            taxGroupName: row.taxGroup.name,
          })
        : null;
    return dto;
  }
}
