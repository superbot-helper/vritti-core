import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';

const IDENTIFIER_TYPES = [
  'PAN',
  'AADHAAR',
  'PASSPORT',
  'DRIVING_LICENSE',
  'VOTER_ID',
  'CIVIL_ID',
  'NATIONAL_ID',
  'DUNS',
  'LEI',
  'CIN',
  'TIN',
  'EIN',
  'UTR',
  'ABN',
] as const;

export type IdentifierType = (typeof IDENTIFIER_TYPES)[number];

export const identifierTypeSchema = z.enum(IDENTIFIER_TYPES);

export const IDENTIFIER_TYPE_LABELS: Record<IdentifierType, string> = {
  PAN: 'PAN (India)',
  AADHAAR: 'Aadhaar (India)',
  PASSPORT: 'Passport',
  DRIVING_LICENSE: 'Driving License',
  VOTER_ID: 'Voter ID',
  CIVIL_ID: 'Civil ID',
  NATIONAL_ID: 'National ID',
  DUNS: 'DUNS',
  LEI: 'LEI',
  CIN: 'CIN (India)',
  TIN: 'TIN',
  EIN: 'EIN (US)',
  UTR: 'UTR (UK)',
  ABN: 'ABN (Australia)',
};

// Identifier types that are a party's tax identification number in some country
export const TAX_ID_IDENTIFIER_TYPES: IdentifierType[] = ['PAN', 'TIN', 'EIN', 'UTR', 'ABN'];

export const IDENTIFIER_TYPE_OPTIONS = IDENTIFIER_TYPES.map((value) => ({
  value,
  label: IDENTIFIER_TYPE_LABELS[value],
}));

const PERSON_IDENTIFIER_TYPES: IdentifierType[] = [
  'PAN',
  'AADHAAR',
  'PASSPORT',
  'DRIVING_LICENSE',
  'VOTER_ID',
  'CIVIL_ID',
  'NATIONAL_ID',
  'TIN',
  'UTR',
];

const COMPANY_IDENTIFIER_TYPES: IdentifierType[] = ['PAN', 'CIN', 'LEI', 'DUNS', 'TIN', 'EIN', 'UTR', 'ABN'];

export const PERSON_IDENTIFIER_TYPE_OPTIONS = PERSON_IDENTIFIER_TYPES.map((value) => ({
  value,
  label: IDENTIFIER_TYPE_LABELS[value],
}));

export const COMPANY_IDENTIFIER_TYPE_OPTIONS = COMPANY_IDENTIFIER_TYPES.map((value) => ({
  value,
  label: IDENTIFIER_TYPE_LABELS[value],
}));

export const addIdentifierSchema = z.object({
  idType: identifierTypeSchema,
  idValue: z.string().min(1, 'Number is required').max(100, 'Number must be at most 100 characters'),
  isPrimary: z.boolean().optional(),
});

export type AddIdentifierFormData = z.infer<typeof addIdentifierSchema>;

export interface AddIdentifierPayload {
  idType: IdentifierType;
  idValue: string;
  isPrimary?: boolean;
}

export interface PartyIdentifierRow {
  id: string;
  partyId: string;
  idType: IdentifierType;
  idValue: string;
  isPrimary: boolean;
  isActive: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export type PartyIdentifiersTableResponse = TableResponse<PartyIdentifierRow>;
