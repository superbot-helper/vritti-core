import type { TaxRegistrationType } from '@/db/schema';
import type { SupplierEnrollmentWithPicks } from '../../repositories/supplier-enrollments.repository';

export class SupplierEnrollmentDto {
  id: string;
  supplierId: string;
  siteId: string;
  paymentTermId: string;
  paymentTermName: string;
  partyTaxRegistrationId: string | null;
  partyBankAccountId: string | null;
  registrationNumber: string | null;
  registrationType: TaxRegistrationType | null;
  bankAccountName: string | null;
  bankName: string | null;
  orderRelationshipId: string | null;
  orderContactLabel: string | null;
  orderContactName: string | null;
  orderContactEmail: string | null;
  orderContactPhone: string | null;
  orderEmailCommunicationId: string;
  orderPhoneCommunicationId: string;
  orderEmail: string;
  orderPhone: string;
  // Active at the site: the enrollment's own flag and the supplier's at LE
  isActive: boolean;
  isSupplierActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Maps an enrollment joined with its picks to a SupplierEnrollmentDto
  static from(entity: SupplierEnrollmentWithPicks): SupplierEnrollmentDto {
    const dto = new SupplierEnrollmentDto();
    dto.id = entity.id;
    dto.supplierId = entity.supplierId;
    dto.siteId = entity.siteId;
    dto.paymentTermId = entity.paymentTermId;
    dto.paymentTermName = entity.paymentTermName;
    dto.partyTaxRegistrationId = entity.partyTaxRegistrationId ?? null;
    dto.partyBankAccountId = entity.partyBankAccountId ?? null;
    dto.registrationNumber = entity.registrationNumber ?? null;
    dto.registrationType = entity.registrationType ?? null;
    dto.bankAccountName = entity.bankAccountName ?? null;
    dto.bankName = entity.bankName ?? null;
    dto.orderRelationshipId = entity.orderRelationshipId ?? null;
    dto.orderContactLabel = entity.orderContactLabel ?? null;
    dto.orderContactName = entity.orderContactName ?? null;
    dto.orderContactEmail = entity.orderContactEmail ?? null;
    dto.orderContactPhone = entity.orderContactPhone ?? null;
    dto.orderEmailCommunicationId = entity.orderEmailCommunicationId;
    dto.orderPhoneCommunicationId = entity.orderPhoneCommunicationId;
    dto.orderEmail = entity.orderEmail;
    dto.orderPhone = entity.orderPhone;
    dto.isActive = entity.isActive && entity.isSupplierActive;
    dto.isSupplierActive = entity.isSupplierActive;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
