import { CHECKOUT_REFERENCE_TYPE, type Checkout, readCheckoutAttempt } from '@vritti/vap-sdk';
import { requireParty } from '../../party.js';
import { resolvePayload } from '../../payload-adapter.js';
import { vapSdk } from '../../visitor-session.js';
import { CheckoutProviders } from '../layout/CheckoutProviders.js';
import { type CheckoutResultSearchParams, uuidValue } from '../lib/search-params.js';
import { ResultScreen } from '../screens/ResultScreen.js';
import { type CheckoutPaths, DEFAULT_CHECKOUT_PATHS } from '../types.js';
import { requestLocale } from './request-locale.js';

export interface CheckoutResultPageProps {
  // The route's search params, as Next hands them to a page
  searchParams: Promise<CheckoutResultSearchParams>;
  // The store's name: "Back to {brandName}" on the result cards
  brandName: string;
  paths?: Partial<CheckoutPaths>;
}

// Where the gateway hands the shopper back to, mounted full screen by the storefront's /checkout/return route. Reads
// the checkout (`?checkout=<id>`, or the checkout `?intent=<id>` paid for) and shows its outcome
export async function CheckoutResultPage({ searchParams, brandName, paths }: CheckoutResultPageProps) {
  const params = await searchParams;
  const routes: CheckoutPaths = { ...DEFAULT_CHECKOUT_PATHS, ...(paths ?? {}) };
  const checkoutParam = uuidValue(params.checkout);
  const attempt = readCheckoutAttempt(params);

  const query = new URLSearchParams();
  if (checkoutParam) query.set('checkout', checkoutParam);
  if (attempt) query.set('intent', attempt.paymentIntentId);
  const party = await requireParty(`${routes.result}${query.size > 0 ? `?${query}` : ''}`);
  const payload = await resolvePayload();
  const sdk = await vapSdk(payload, { partyId: party.partyId });

  let checkout: Checkout | null = null;
  try {
    let checkoutId = checkoutParam ?? '';
    if (!checkoutId && attempt) {
      const intent = await sdk.payments.paymentIntent(attempt.paymentIntentId);
      checkoutId = intent.checkoutId ?? (intent.reference.type === CHECKOUT_REFERENCE_TYPE ? intent.reference.id : '');
    }
    if (checkoutId) checkout = await sdk.checkout.find(checkoutId);
  } catch (error) {
    payload.logger?.error({ err: error }, 'Could not read a checkout for its result page');
  }

  // Store names for the orders; the orders still show by number without them
  let storeNames: Record<string, string> = {};
  try {
    storeNames = Object.fromEntries((await sdk.structure.sites()).map((site) => [site.id, site.name]));
  } catch {
    storeNames = {};
  }

  return (
    <CheckoutProviders locale={await requestLocale()}>
      <ResultScreen
        initial={checkout}
        storeNames={storeNames}
        brandName={brandName}
        justPaid={Boolean(attempt)}
        paths={routes}
      />
    </CheckoutProviders>
  );
}

// The earlier name, kept for storefronts that mount it
export { CheckoutResultPage as CheckoutResult };
export type { CheckoutResultPageProps as CheckoutResultProps };
