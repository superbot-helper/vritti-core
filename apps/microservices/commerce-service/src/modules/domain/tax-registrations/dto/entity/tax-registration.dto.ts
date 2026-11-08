import type { TaxRegistration, TaxRegistrationType } from '@/db/schema';

export class TaxRegistrationDto {
  id: string;
  legalEntityId: string;
  countryCode: string;
  jurisdictionId: string | null;
  jurisdictionName: string | null;
  jurisdictionCode: string | null;
  registrationNumber: string;
  registrationType: TaxRegistrationType;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Maps a registration with its jurisdiction's name and code — both null for a national registration
  static from(
    entity: TaxRegistration & { jurisdictionName?: string | null; jurisdictionCode?: string | null },
  ): TaxRegistrationDto {
    const dto = new TaxRegistrationDto();
    dto.id = entity.id;
    dto.legalEntityId = entity.legalEntityId;
    dto.countryCode = entity.countryCode;
    dto.jurisdictionId = entity.jurisdictionId ?? null;
    dto.jurisdictionName = entity.jurisdictionName ?? null;
    dto.jurisdictionCode = entity.jurisdictionCode ?? null;
    dto.registrationNumber = entity.registrationNumber;
    dto.registrationType = entity.registrationType;
    dto.isPrimary = entity.isPrimary;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
