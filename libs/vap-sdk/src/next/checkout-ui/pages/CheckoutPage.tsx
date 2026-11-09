import { type Cart, type Checkout, type PartyAddress, readCheckoutRetry } from '@vritti/vap-sdk';
import { redirect } from 'next/navigation';
import { requireParty } from '../../party.js';
import { resolvePayload } from '../../payload-adapter.js';
import { vapSdk } from '../../visitor-session.js';
import { CheckoutProviders } from '../layout/CheckoutProviders.js';
import { isLive } from '../lib/outcome.js';
import { type CheckoutSearchParams, firstValue, uuidValue } from '../lib/search-params.js';
import { storesFromCart } from '../lib/stores.js';
import { PayScreen } from '../screens/PayScreen.js';
import { StartScreen } from '../screens/StartScreen.js';
import { type CheckoutPaths, type CheckoutPolicyLink, type CheckoutReturn, DEFAULT_CHECKOUT_PATHS } from '../types.js';
import { requestLocale } from './request-locale.js';

export interface CheckoutPageProps {
  // The route's search params, as Next hands them to a page
  searchParams: Promise<CheckoutSearchParams>;
  // The store's name: "Back to {brandName}" on its cards, the name the gateway's payment page shows, and the mark at
  // the top of the order summary when there is no logo
  brandName: string;
  // The store's logo, at the top of the order summary
  brandLogoUrl?: string | null;
  // The store's policy pages, linked under the form
  policyLinks?: CheckoutPolicyLink[];
  paths?: Partial<CheckoutPaths>;
}

// The VAP checkout page — the same full-screen page on every storefront, under VAP's own header. A storefront mounts
// it at /checkout in a route that renders none of its own header or footer, and imports
// `@vritti/vap-sdk/next/checkout-ui.css` there:
//
//   export default function Page({ searchParams }) {
//     return <CheckoutPage searchParams={searchParams} brandName="Desi Taakat" />;
//   }
//
// The checkout is made by the storefront cart's Checkout button (`beginCheckoutAction`), which opens this page on it
// (`?checkout=<id>`, its 30-minute timer already running). The gateway sends the shopper back here after a decline or a
// cancel (`payment=failed|cancelled`). With no live checkout — none named, it ended, or starting failed (`?error=`) —
// the page offers to start one
export async function CheckoutPage({ searchParams, brandName, brandLogoUrl, policyLinks, paths }: CheckoutPageProps) {
  const params = await searchParams;
  const routes: CheckoutPaths = { ...DEFAULT_CHECKOUT_PATHS, ...(paths ?? {}) };
  // Amounts and dates in the shopper's own browser locale
  const shopperLocale = await requestLocale();
  const checkoutId = uuidValue(params.checkout);

  const party = await requireParty(checkoutId ? `${routes.checkout}?checkout=${checkoutId}` : routes.checkout);
  const payload = await resolvePayload();
  const sdk = await vapSdk(payload, { partyId: party.partyId });
  const [cart, addresses, checkout] = await Promise.all([
    settle<Cart>(() => sdk.cart.items()),
    settle<PartyAddress[]>(() => sdk.people.addresses()),
    checkoutId ? settle<Checkout>(() => sdk.checkout.find(checkoutId)) : null,
  ]);

  // Paid already (a late return to this page): the result page shows the orders
  if (checkout && (checkout.status === 'CONVERTED' || checkout.status === 'PAID')) {
    redirect(`${routes.result}?checkout=${checkout.id}`);
  }
  const stores = storesFromCart(cart);

  if (!checkout || !isLive(checkout)) {
    return (
      <CheckoutProviders locale={shopperLocale}>
        <StartScreen
          // A cancelled checkout opened again offers a fresh start; an expired one says it expired
          kind={checkout && checkout.status !== 'CANCELLED' ? 'expired' : 'start'}
          empty={stores.length === 0}
          error={firstValue(params.error)?.slice(0, 200)}
          siteId={uuidValue(params.site) ?? (checkout?.sites.length === 1 ? checkout.sites[0].siteId : undefined)}
          brandName={brandName}
          paths={routes}
        />
      </CheckoutProviders>
    );
  }

  const retry = readCheckoutRetry(params);
  const returned: CheckoutReturn = {
    ...(retry.outcome ? { outcome: retry.outcome } : {}),
    ...(retry.message ? { message: retry.message } : {}),
  };

  return (
    <CheckoutProviders locale={shopperLocale}>
      <PayScreen
        brandName={brandName}
        brandLogoUrl={brandLogoUrl ?? null}
        policyLinks={policyLinks ?? []}
        stores={stores}
        togetherGateways={cart?.checkout.gateways ?? []}
        gatewayLogos={Object.fromEntries((cart?.gatewayLogos ?? []).map((entry) => [entry.gatewayCode, entry.logoUrl]))}
        addresses={addresses}
        checkout={checkout}
        returned={returned}
        paths={routes}
      />
    </CheckoutProviders>
  );
}

// The value, or null when core could not be reached — the page says so instead of failing
async function settle<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch {
    return null;
  }
}
