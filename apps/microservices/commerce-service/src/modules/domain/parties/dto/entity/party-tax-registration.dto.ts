import type { PartyTaxRegistration, TaxRegistrationScheme, TaxRegistrationType } from '@/db/schema';

export class PartyTaxRegistrationDto {
  id: string;
  partyId: string;
  countryCode: string;
  jurisdictionId: string | null;
  jurisdictionName: string | null;
  registrationNumber: string;
  registrationType: TaxRegistrationType;
  scheme: TaxRegistrationScheme;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Maps a PartyTaxRegistration entity to a PartyTaxRegistrationDto; a national registration has no jurisdiction
  static from(entity: PartyTaxRegistration, jurisdictionName: string | null = null): PartyTaxRegistrationDto {
    const dto = new PartyTaxRegistrationDto();
    dto.id = entity.id;
    dto.partyId = entity.partyId;
    dto.countryCode = entity.countryCode;
    dto.jurisdictionId = entity.jurisdictionId ?? null;
    dto.jurisdictionName = jurisdictionName;
    dto.registrationNumber = entity.registrationNumber;
    dto.registrationType = entity.registrationType;
    dto.scheme = entity.scheme;
    dto.isPrimary = entity.isPrimary;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
