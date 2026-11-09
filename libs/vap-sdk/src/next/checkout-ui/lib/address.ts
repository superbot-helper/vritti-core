import type { PartyAddress } from '@vritti/vap-sdk';

export type AddressLines = { first: string; second: string };

// The address as one line under the name, and the town line under it
export function addressLines(address: PartyAddress): AddressLines {
  return {
    first: [address.line1, address.line2].filter(Boolean).join(', '),
    second: [address.city, address.region, address.postalCode, address.countryCode].filter(Boolean).join(', '),
  };
}
