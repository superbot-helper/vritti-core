import type { Checkout } from '@vritti/vap-sdk';

export type CheckoutOutcome = 'paid' | 'pending' | 'failed' | 'closed' | 'not-found';

// What a checkout and its latest payment add up to for the shopper. A checkout is placed once its orders exist; money
// that landed before they are made (PAID, or a succeeded payment core is still settling) is "pending", never "failed"
export function checkoutOutcome(checkout: Checkout | null): CheckoutOutcome {
  if (!checkout) return 'not-found';
  const intent = checkout.paymentIntent;
  if (checkout.status === 'CONVERTED') return 'paid';
  if (checkout.status === 'PAID') return 'pending';
  if (intent?.status === 'SUCCEEDED' || intent?.status === 'PROCESSING') return 'pending';
  if (checkout.status === 'CANCELLED' || checkout.status === 'EXPIRED') return 'closed';
  if (!isLive(checkout)) return 'closed';
  // Back from the gateway with the payment still open: the callback may not have reached core yet
  if (intent?.status === 'CREATED' || intent?.status === 'REQUIRES_ACTION') return 'pending';
  return 'failed';
}

// Open, and its 30-minute window not yet closed
export function isLive(checkout: Checkout): boolean {
  return checkout.status === 'OPEN' && new Date(checkout.expiresAt).getTime() > Date.now();
}
