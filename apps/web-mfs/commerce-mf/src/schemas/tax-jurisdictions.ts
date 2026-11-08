import { ISO_COUNTRIES } from '@vritti/quantum-ui/selects/iso-country';
import type { CreateResponse, SuccessResponse, TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z, zodCodeField } from '@vritti/quantum-ui/zod';

// Sub-national levels a jurisdiction can occupy, broad to narrow; the whole country is its country code alone
export const TaxJurisdictionLevelValues = {
  STATE: 'STATE',
  COUNTY: 'COUNTY',
  CITY: 'CITY',
  DISTRICT: 'DISTRICT',
} as const;
export type TaxJurisdictionLevel = (typeof TaxJurisdictionLevelValues)[keyof typeof TaxJurisdictionLevelValues];

export const LEVELS = Object.values(TaxJurisdictionLevelValues) as [TaxJurisdictionLevel, ...TaxJurisdictionLevel[]];

export const LEVEL_LABELS: Record<TaxJurisdictionLevel, string> = {
  STATE: 'State',
  COUNTY: 'County',
  CITY: 'City',
  DISTRICT: 'District',
};

export const levelOptions = LEVELS.map((value) => ({ value, label: LEVEL_LABELS[value] }));

export const PARENT_LEVEL_HINTS: Record<TaxJurisdictionLevel, string> = {
  STATE: 'A state sits at the top of its country',
  COUNTY: 'The state it sits in',
  CITY: 'The state or county it sits in',
  DISTRICT: 'The jurisdiction it sits in',
};

export const CHILD_LEVEL: Record<TaxJurisdictionLevel, TaxJurisdictionLevel> = {
  STATE: 'COUNTY',
  COUNTY: 'CITY',
  CITY: 'DISTRICT',
  DISTRICT: 'DISTRICT',
};

const ISO_COUNTRY_CODES = new Set(ISO_COUNTRIES.map(({ code }) => code));

export const countryCodeField = z
  .string({ error: 'Country is required' })
  .refine((code) => ISO_COUNTRY_CODES.has(code), 'Country is required');

const parentBelowState = {
  check: (data: { level: TaxJurisdictionLevel; parentId?: string | null }) =>
    data.level === TaxJurisdictionLevelValues.STATE || !!data.parentId,
  params: { path: ['parentId'], message: 'Select the jurisdiction this one sits under' },
};

export const taxJurisdictionSchema = z
  .object({
    code: zodCodeField({ max: 50 }),
    name: z.string({ error: 'Name is required' }).min(1, 'Name is required').max(255),
    countryCode: countryCodeField,
    level: z.enum(LEVELS, { error: 'Level is required' }),
    parentId: z.uuid('Select the jurisdiction this one sits under').nullish(),
    regionCode: z.string().max(10).optional(),
    taxUnion: z.string().max(50).optional(),
    isActive: z.boolean(),
  })
  .refine(parentBelowState.check, parentBelowState.params);

export type TaxJurisdictionFormData = z.infer<typeof taxJurisdictionSchema>;

export interface TaxJurisdictionPayload {
  code: string;
  name: string;
  countryCode: string;
  level: TaxJurisdictionLevel;
  parentId: string | null;
  regionCode?: string;
  taxUnion?: string;
  isActive: boolean;
}

export interface TaxJurisdictionData {
  id: string;
  code: string;
  name: string;
  level: TaxJurisdictionLevel;
  parentId: string | null;
  parentName: string | null;
  countryCode: string;
  regionCode: string | null;
  taxUnion: string | null;
  isActive: boolean;
  canDelete: boolean;
  hasChildren?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxJurisdictionTreeQuery {
  search?: string;
  country?: string;
}

export interface TaxJurisdictionTreeNode {
  id: string;
  name: string;
  level: TaxJurisdictionLevel;
  children?: TaxJurisdictionTreeNode[];
}

export interface TaxJurisdictionCountData {
  count: number;
}

export type TaxJurisdictionChildrenTableResponse = TableResponse<TaxJurisdictionData>;

export type TaxJurisdictionCreateResponse = CreateResponse<TaxJurisdictionData>;
export type { SuccessResponse };
