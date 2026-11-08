import type { TaxAuthorityLevel, TaxComponent } from '@/db/schema';

export class TaxComponentDto {
  id: string;
  countryCode: string;
  code: string;
  name: string;
  authorityLevel: TaxAuthorityLevel;
  isRecoverable: boolean;
  isWithholding: boolean;
  isActive: boolean;
  isSystem: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;

  // Maps a tax component with its rate count; system components and those tax-group rates use cannot be deleted
  static from(entity: TaxComponent & { rateCount: number }): TaxComponentDto {
    const dto = new TaxComponentDto();
    dto.id = entity.id;
    dto.countryCode = entity.countryCode;
    dto.code = entity.code;
    dto.name = entity.name;
    dto.authorityLevel = entity.authorityLevel;
    dto.isRecoverable = entity.isRecoverable;
    dto.isWithholding = entity.isWithholding;
    dto.isActive = entity.isActive;
    dto.isSystem = entity.isSystem;
    dto.canDelete = !entity.isSystem && entity.rateCount === 0;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
