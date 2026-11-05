export const PARTY_TAX_REGISTRATIONS_KEY = ['commerce', 'party-tax-registrations'] as const;
export const PARTY_HAS_SALES_TAX_REGISTRATION_KEY = (partyId: string) =>
  [...PARTY_TAX_REGISTRATIONS_KEY, partyId, 'has-sales-tax'] as const;
