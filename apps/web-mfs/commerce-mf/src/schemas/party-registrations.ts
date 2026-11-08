import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';
import { countryCodeField } from './tax-jurisdictions';
import { gstinNamesState, REGISTRATION_TYPES, type RegistrationType } from './tax-registrations';

export { REGISTRATION_TYPE_LABELS, REGISTRATION_TYPE_OPTIONS, type RegistrationType } from './tax-registrations';

// The commerce `tax_registration_scheme` enum — how the party is registered under its number
export const REGISTRATION_SCHEMES = ['REGULAR', 'COMPOSITION', 'SEZ'] as const;
export type RegistrationScheme = (typeof REGISTRATION_SCHEMES)[number];

export const REGISTRATION_SCHEME_LABELS: Record<RegistrationScheme, string> = {
  REGULAR: 'Regular',
  COMPOSITION: 'Composition',
  SEZ: 'SEZ',
};

export const REGISTRATION_SCHEME_OPTIONS = REGISTRATION_SCHEMES.map((value) => ({
  value,
  label: REGISTRATION_SCHEME_LABELS[value],
}));

export const partyRegistrationSchema = z
  .object({
    countryCode: countryCodeField,
    jurisdictionId: z.uuid('Select a valid state').nullish(),
    registrationNumber: z
      .string({ error: 'Registration number is required' })
      .min(1, 'Registration number is required')
      .max(50, 'Registration number cannot exceed 50 characters'),
    registrationType: z.enum(REGISTRATION_TYPES),
    scheme: z.enum(REGISTRATION_SCHEMES),
    isPrimary: z.boolean(),
  })
  .refine(gstinNamesState.check, gstinNamesState.params);

export type PartyRegistrationFormData = z.infer<typeof partyRegistrationSchema>;

export interface PartyRegistrationPayload {
  countryCode: string;
  jurisdictionId: string | null;
  registrationNumber: string;
  registrationType: RegistrationType;
  scheme: RegistrationScheme;
  isPrimary: boolean;
}

export interface PartyTaxRegistrationRow {
  id: string;
  countryCode: string;
  jurisdictionId: string | null;
  jurisdictionName: string | null;
  registrationNumber: string;
  registrationType: RegistrationType;
  scheme: RegistrationScheme;
  isPrimary: boolean;
  // Inactive registrations stay on record but cannot be picked for a supplier's site enrollment
  isActive: boolean;
}

export type PartyRegistrationsTableResponse = TableResponse<PartyTaxRegistrationRow>;
