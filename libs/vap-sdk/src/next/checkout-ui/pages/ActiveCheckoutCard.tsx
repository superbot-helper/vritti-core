import { ActiveCheckoutCardView } from '../card/ActiveCheckoutCardView.js';
import { CheckoutProviders } from '../layout/CheckoutProviders.js';
import { type CheckoutPaths, DEFAULT_CHECKOUT_PATHS } from '../types.js';
import { requestLocale } from './request-locale.js';

export interface ActiveCheckoutCardProps {
  // The storefront's checkout and result pages (the card hides on them, and Resume opens the first)
  paths?: Partial<CheckoutPaths>;
}

// The "checkout in progress" card, for a storefront's shop layout — every page outside the checkout. It reads the
// signed-in party's live checkout itself, on each page change, so it needs nothing passed but the storefront's paths.
// Its stylesheet is `@vritti/vap-sdk/next/checkout-card.css`, a small one apart from the checkout page's:
//
//   // app/(shop)/layout.tsx
//   import '@vritti/vap-sdk/next/checkout-card.css';
//   import { ActiveCheckoutCard } from '@vritti/vap-sdk/next/checkout-card';
//   …
//   <ActiveCheckoutCard paths={{ checkout: '/checkout', result: '/checkout/return' }} />
export async function ActiveCheckoutCard({ paths }: ActiveCheckoutCardProps) {
  const routes: CheckoutPaths = { ...DEFAULT_CHECKOUT_PATHS, ...(paths ?? {}) };
  return (
    <CheckoutProviders locale={await requestLocale()}>
      <ActiveCheckoutCardView paths={routes} />
    </CheckoutProviders>
  );
}
