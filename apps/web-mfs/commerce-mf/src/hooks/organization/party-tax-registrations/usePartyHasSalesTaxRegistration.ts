import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getPartyHasSalesTaxRegistration } from '@/services/organization/party-tax-registrations.service';
import { PARTY_HAS_SALES_TAX_REGISTRATION_KEY } from './keys';

// Whether a party holds an active sales-tax (GSTIN or VAT) registration; idle until the party is known
export function usePartyHasSalesTaxRegistration(partyId: string | undefined) {
  return useQuery<boolean, AxiosError>({
    queryKey: PARTY_HAS_SALES_TAX_REGISTRATION_KEY(partyId ?? ''),
    queryFn: () => getPartyHasSalesTaxRegistration(partyId as string),
    enabled: !!partyId,
  });
}
