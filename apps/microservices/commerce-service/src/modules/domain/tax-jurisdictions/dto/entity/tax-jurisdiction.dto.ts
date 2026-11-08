import type { TaxJurisdictionLevel } from '@/db/schema';
import type { TaxJurisdictionDetail } from '../../repositories/tax-jurisdictions.repository';

export class TaxJurisdictionDto {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  level: TaxJurisdictionLevel;
  parentId: string | null;
  parentName: string | null;
  countryCode: string;
  regionCode: string | null;
  taxUnion: string | null;
  isActive: boolean;
  hasChildren: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;

  // Maps a jurisdiction with its parent name and usage; children or references keep it from being deleted
  static from(entity: TaxJurisdictionDetail): TaxJurisdictionDto {
    const dto = new TaxJurisdictionDto();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.code = entity.code;
    dto.name = entity.name;
    dto.level = entity.level;
    dto.parentId = entity.parentId ?? null;
    dto.parentName = entity.parentName;
    dto.countryCode = entity.countryCode;
    dto.regionCode = entity.regionCode ?? null;
    dto.taxUnion = entity.taxUnion ?? null;
    dto.isActive = entity.isActive;
    dto.hasChildren = entity.hasChildren;
    dto.canDelete = !entity.hasChildren && !entity.isReferenced;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
