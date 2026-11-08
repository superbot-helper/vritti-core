import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';
import { countryCodeField } from './tax-jurisdictions';

// The commerce `tax_registration_type` enum — every registration form offers exactly these
export const REGISTRATION_TYPES = ['GSTIN', 'VAT', 'TIN', 'OTHER'] as const;
export type RegistrationType = (typeof REGISTRATION_TYPES)[number];

export const REGISTRATION_TYPE_LABELS: Record<RegistrationType, string> = {
  GSTIN: 'GSTIN',
  VAT: 'VAT',
  TIN: 'TIN',
  OTHER: 'Other',
};

export const REGISTRATION_TYPE_OPTIONS = REGISTRATION_TYPES.map((value) => ({
  value,
  label: REGISTRATION_TYPE_LABELS[value],
}));

// A GSTIN is issued per state, so it names one; VAT, TIN and other numbers may be national
export const gstinNamesState = {
  check: (data: { registrationType: RegistrationType; jurisdictionId?: string | null }) =>
    data.registrationType !== 'GSTIN' || !!data.jurisdictionId,
  params: { path: ['jurisdictionId'], message: 'A GSTIN is issued per state — select the state' },
};

export interface TaxRegistrationData {
  id: string;
  legalEntityId: string;
  countryCode: string;
  jurisdictionId: string | null;
  jurisdictionName: string | null;
  jurisdictionCode: string | null;
  registrationNumber: string;
  registrationType: RegistrationType;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaxRegistrationsTableResponse = TableResponse<TaxRegistrationData>;

export const taxRegistrationSchema = z
  .object({
    countryCode: countryCodeField,
    jurisdictionId: z.uuid('Select a valid state').nullish(),
    registrationNumber: z
      .string({ error: 'Registration number is required' })
      .min(1, 'Registration number is required')
      .max(50, 'Registration number cannot exceed 50 characters'),
    registrationType: z.enum(REGISTRATION_TYPES),
    isPrimary: z.boolean(),
  })
  .refine(gstinNamesState.check, gstinNamesState.params);

export type TaxRegistrationFormData = z.infer<typeof taxRegistrationSchema>;

export interface CreateTaxRegistrationData {
  countryCode: string;
  jurisdictionId: string | null;
  registrationNumber: string;
  registrationType: RegistrationType;
  isPrimary: boolean;
}

export type UpdateTaxRegistrationData = Partial<CreateTaxRegistrationData & { isActive: boolean }>;
