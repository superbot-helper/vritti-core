import type { PartyAddress } from '@vritti/vap-sdk';
import { getCurrentParty } from './party.js';
import { resolvePayload } from './payload-adapter.js';
import { vapSdk } from './visitor-session.js';

// Where the signed-in party's orders are delivered, for a storefront header's "Deliver to": the default address and
// the rest of the address book to switch between. Server-only; no directive, so it is a plain read, not an action.

export type DeliveryAddresses = {
  // The party's default delivery address (primary shipping), else their first; null with none saved
  current: PartyAddress | null;
  addresses: PartyAddress[];
};

// Null when nobody is signed in, or when core cannot be reached — a header shows nothing rather than failing the page
export async function getDeliveryAddresses(): Promise<DeliveryAddresses | null> {
  const party = await getCurrentParty();
  if (!party?.partyId) return null;
  try {
    const payload = await resolvePayload();
    const addresses = await (await vapSdk(payload, { partyId: party.partyId })).people.addresses();
    return { current: addresses.find((address) => address.isDefault) ?? addresses[0] ?? null, addresses };
  } catch {
    return null;
  }
}
