import type { Money } from '@vritti/vap-sdk';

// What the VAP checkout page shows, shared by its server and client halves. Everything here crosses from a server
// component to a client one, so it is plain data. The page looks the same on every storefront: only these facts and
// the storefront's paths change.

// One store the cart holds something buyable at
export type CheckoutPageStore = {
  siteId: string;
  name: string;
  subtotal: Money;
  // The gateways that store takes payments through, e.g. "razorpay"
  gateways: string[];
  lines: { id: string; name: string; quantity: number; unitPrice: Money | null; lineTotal: Money | null }[];
};

// One of the store's policy pages, linked under the form
export type CheckoutPolicyLink = { label: string; href: string };

// What the gateway said when it sent the shopper back to the checkout page
export type CheckoutReturn = { outcome?: 'failed' | 'cancelled'; message?: string };

// The storefront's own pages the checkout links to and comes back to
export type CheckoutPaths = {
  // The checkout page; the gateway sends the shopper back here after a decline or a cancel
  checkout: string;
  // The page that shows the outcome, mounting `CheckoutResultPage`
  result: string;
  // Where Cancel and the closed cards go
  cart: string;
  // Where the shopper adds an address when none is saved; no link when left out
  addresses?: string;
};

// The store's home page: where the paid card and the empty-cart card send the shopper
export const STORE_HOME = '/';

export const DEFAULT_CHECKOUT_PATHS: CheckoutPaths = {
  checkout: '/checkout',
  result: '/checkout/return',
  cart: '/cart',
};
