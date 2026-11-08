import type { TaxJurisdictionLevel } from '@/db/schema';

export interface TaxJurisdictionTreeDto {
  id: string;
  name: string;
  code: string;
  level: TaxJurisdictionLevel;
  countryCode: string;
  children?: TaxJurisdictionTreeDto[];
}
