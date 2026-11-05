import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';
import type { IdentifierType } from './party-identifiers';
import type { RegistrationType } from './tax-registrations';

// The enrollment's own active flag (null when not enrolled), and the supplier's active flag and blocks
export interface EnrollmentFlags {
  isActive: boolean | null;
  isSupplierActive: boolean;
  purchasingBlocked: boolean;
  paymentBlocked: boolean;
}

export type SupplierEnrollmentStatus = 'ENROLLED' | 'NOT_ENROLLED';

export const SUPPLIER_ENROLLMENT_STATUS_OPTIONS: { value: SupplierEnrollmentStatus; label: string }[] = [
  { value: 'ENROLLED', label: 'Enrolled' },
  { value: 'NOT_ENROLLED', label: 'Not Enrolled' },
];

export interface SupplierEnrollmentKey {
  supplierId: string;
  siteId: string;
}

// The picks of an enrollment: a payment term and ordering email and phone always, the rest optional
export interface SupplierEnrollmentPicks {
  paymentTermId: string;
  partyTaxRegistrationId: string | null;
  partyBankAccountId: string | null;
  orderRelationshipId: string | null;
  orderEmailCommunicationId: string;
  orderPhoneCommunicationId: string;
}

// One enrollment with its picks resolved; payment term and ordering email and phone are always set
export interface SupplierEnrollment extends SupplierEnrollmentKey {
  id: string;
  paymentTermId: string;
  paymentTermName: string;
  partyTaxRegistrationId: string | null;
  partyBankAccountId: string | null;
  registrationNumber: string | null;
  registrationType: RegistrationType | null;
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
}

// The supplier's side of a (supplier, site) pair, set whether or not the supplier is enrolled at the site
interface SupplierEnrollmentRowBase extends SupplierEnrollmentKey {
  supplierCode: string;
  partyId: string;
  partyName: string;
  partyType: 'COMPANY' | 'PERSON';
  siteName: string | null;
  siteCode: string | null;
  currencyCode: string;
  defaultPaymentTermId: string;
  isSupplierActive: boolean;
  purchasingBlocked: boolean;
  paymentBlocked: boolean;
}

// A pair with an enrollment; `id` is the enrollment
export interface EnrolledSupplierEnrollmentRow extends SupplierEnrollmentRowBase, SupplierEnrollmentPicks {
  enrollmentStatus: 'ENROLLED';
  id: string;
  // Active at the site: the enrollment's own flag and the supplier's at LE
  isActive: boolean;
  paymentTermName: string;
  registrationNumber: string | null;
  bankAccountName: string | null;
  orderContactLabel: string | null;
  orderContactName: string | null;
  orderEmail: string;
  orderPhone: string;
  enrolledAt: string;
}

// A pair without an enrollment; every enrollment field is null
export interface NotEnrolledSupplierEnrollmentRow extends SupplierEnrollmentRowBase {
  enrollmentStatus: 'NOT_ENROLLED';
  id: null;
  isActive: null;
  paymentTermId: null;
  paymentTermName: null;
  partyTaxRegistrationId: null;
  registrationNumber: null;
  partyBankAccountId: null;
  bankAccountName: null;
  orderRelationshipId: null;
  orderContactLabel: null;
  orderContactName: null;
  orderEmailCommunicationId: null;
  orderEmail: null;
  orderPhoneCommunicationId: null;
  orderPhone: null;
  enrolledAt: null;
}

// A (supplier, site) pair of the legal entity, narrowed by `enrollmentStatus`
export type SupplierEnrollmentRow = EnrolledSupplierEnrollmentRow | NotEnrolledSupplierEnrollmentRow;

export type SupplierEnrollmentsTableResponse = TableResponse<SupplierEnrollmentRow>;

// A supplier as one site sees it, enrolled there or not
export type SupplierEnrollmentDetail = SupplierEnrollmentRow & {
  partyTaxId: string | null;
  partyTaxIdType: IdentifierType | null;
};

// The supplier's party facts an enrollment form needs, whichever workspace resolves them
export interface SupplierParty {
  partyId: string;
  partyTaxId: string | null;
  partyTaxIdType: IdentifierType | null;
  defaultPaymentTermId: string;
}

// The enrollment's order email and phone: the supplier's communications tagged Ordering
const orderCommunicationFields = {
  orderEmailCommunicationId: z.uuid('Order email is required'),
  orderPhoneCommunicationId: z.uuid('Order phone is required'),
};

const enrollmentFields = {
  paymentTermId: z.uuid('Payment term is required'),
  partyTaxRegistrationId: z.uuid().nullable().optional(),
  partyBankAccountId: z.uuid().nullable().optional(),
  orderRelationshipId: z.uuid().nullable().optional(),
  ...orderCommunicationFields,
};

export const createSupplierEnrollmentSchema = z.object({
  supplierId: z.uuid('Supplier is required'),
  siteId: z.uuid('Site is required'),
  ...enrollmentFields,
  isActive: z.boolean(),
});

export const updateSupplierEnrollmentSchema = z.object(enrollmentFields);

export type CreateSupplierEnrollmentFormData = z.infer<typeof createSupplierEnrollmentSchema>;
export type UpdateSupplierEnrollmentFormData = z.infer<typeof updateSupplierEnrollmentSchema>;

export interface CreateSupplierEnrollmentPayload extends SupplierEnrollmentKey {
  paymentTermId: string;
  partyTaxRegistrationId?: string;
  partyBankAccountId?: string;
  orderRelationshipId?: string;
  orderEmailCommunicationId: string;
  orderPhoneCommunicationId: string;
  isActive: boolean;
}

export interface UpdateSupplierEnrollmentPayload {
  paymentTermId?: string;
  partyTaxRegistrationId?: string | null;
  partyBankAccountId?: string | null;
  orderRelationshipId?: string | null;
  orderEmailCommunicationId?: string;
  orderPhoneCommunicationId?: string;
}

export interface UpdateSupplierEnrollmentVars extends SupplierEnrollmentKey {
  data: UpdateSupplierEnrollmentPayload;
}

export interface SetSupplierEnrollmentActiveVars extends SupplierEnrollmentKey {
  isActive: boolean;
}
