import { CheckoutError, type CheckoutOutcome, type CheckoutPlugin, type PaymentCheckout } from './index.js';
import { asRecord, asText, type CheckoutMode, checkoutModeOf, loadScript, requireBrowser } from './shared.js';

// Easebuzz — `@vritti/vap-sdk/easebuzz`.
//
// Core opens the payment with Easebuzz server-side, and the gateway config says how the browser opens it:
//   - HOSTED: the browser goes to Easebuzz's page. Easebuzz posts the result to core's hosted checkout callback, which
//     reads the payment back from Easebuzz and returns the shopper to the store.
//   - MODAL: Easebuzz's popup (its iframe checkout script) opens on the store's page with the payment's access key.
//     The popup hands its response to the page, which core confirms by reading the payment back from Easebuzz.

// Easebuzz's iframe checkout script, as its integration kits load it
export const EASEBUZZ_CHECKOUT_SCRIPT_URL =
  'https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/v2.0.0/easebuzz-checkout-v2.min.js';

export type EasebuzzEnvironment = 'test' | 'production';

export type EasebuzzSession = {
  url: string;
  txnid: string;
  environment: EasebuzzEnvironment;
  checkoutMode: CheckoutMode;
  // The payment's access key and the merchant key, which the popup opens with (MODAL only)
  accessKey: string | null;
  key: string | null;
};

// What Easebuzz's popup hands back: the transaction, its status, Easebuzz's payment id and the response hash
type EasebuzzResponse = { status?: unknown; txnid?: unknown; easepayid?: unknown; hash?: unknown };

type EasebuzzCheckoutInstance = {
  initiatePayment(options: { access_key: string; onResponse: (response: unknown) => void }): void;
};
// The script's environment names: `prod` for live, anything else is the test host
type EasebuzzCheckoutConstructor = new (key: string, env: 'prod' | 'test') => EasebuzzCheckoutInstance;

// Statuses that mean the shopper left the popup without paying
const EASEBUZZ_LEFT = new Set(['usercancelled', 'dropped']);

// The only hosts an Easebuzz payment page is served from
const EASEBUZZ_PAY_HOSTS: ReadonlySet<string> = new Set(['pay.easebuzz.in', 'testpay.easebuzz.in']);

// What core's payload carries for an Easebuzz checkout. The page must be Easebuzz's own, over https, so a payload that
// was tampered with can never send the shopper somewhere else
export function easebuzzSession(checkout: PaymentCheckout): EasebuzzSession {
  if (checkout.gateway.toLowerCase() !== 'easebuzz') {
    throw new CheckoutError(`This storefront cannot open a "${checkout.gateway}" Easebuzz checkout.`);
  }
  const url = asText(checkout.options.url);
  const txnid = asText(checkout.options.txnid);
  if (!url || !txnid) {
    throw new CheckoutError('This payment has no gateway order to pay, so its checkout cannot be opened.');
  }
  let page: URL;
  try {
    page = new URL(url);
  } catch {
    throw new CheckoutError('This payment’s checkout address is not valid, so it cannot be opened.');
  }
  if (page.protocol !== 'https:' || !EASEBUZZ_PAY_HOSTS.has(page.hostname)) {
    throw new CheckoutError('This payment’s checkout is not on Easebuzz, so it was not opened.');
  }
  const environment: EasebuzzEnvironment = checkout.options.environment === 'production' ? 'production' : 'test';
  return {
    url: page.toString(),
    txnid,
    environment,
    checkoutMode: checkoutModeOf(checkout.options) ?? 'HOSTED',
    accessKey: asText(checkout.options.access_key) ?? null,
    key: asText(checkout.options.key) ?? null,
  };
}

// The Easebuzz plugin
export function easebuzz(): CheckoutPlugin {
  return {
    gateways: ['easebuzz'],
    methods: ['upi', 'card', 'netbanking', 'wallet'],
    async open(checkout) {
      const session = easebuzzSession(checkout);
      requireBrowser('Opening the Easebuzz checkout');
      if (session.checkoutMode === 'MODAL' && session.accessKey && session.key) {
        return openEasebuzzPopup(session, session.accessKey, session.key);
      }
      window.location.assign(session.url);
      return { kind: 'redirected' };
    },
  };
}

// Opens Easebuzz's popup on the store's page and resolves with what its response means for the checkout page
async function openEasebuzzPopup(session: EasebuzzSession, accessKey: string, key: string): Promise<CheckoutOutcome> {
  try {
    await loadScript(EASEBUZZ_CHECKOUT_SCRIPT_URL);
  } catch (error) {
    throw new CheckoutError((error as Error).message);
  }
  const EasebuzzCheckout = Reflect.get(window, 'EasebuzzCheckout') as EasebuzzCheckoutConstructor | undefined;
  if (typeof EasebuzzCheckout !== 'function') {
    throw new CheckoutError('The payment window could not be loaded. Check your connection and try again.');
  }
  const popup = new EasebuzzCheckout(key, session.environment === 'production' ? 'prod' : 'test');
  return new Promise<CheckoutOutcome>((resolve) => {
    popup.initiatePayment({
      access_key: accessKey,
      onResponse: (response) => resolve(popupOutcome(session.txnid, asRecord(response))),
    });
  });
}

// A response for this transaction with Easebuzz's payment id and hash is handed to core, which reads the payment back
// from Easebuzz rather than trusting it; a cancel closes the popup; anything else waits for the result page
function popupOutcome(txnid: string, response: EasebuzzResponse): CheckoutOutcome {
  const status = asText(response.status)?.toLowerCase();
  if (status && EASEBUZZ_LEFT.has(status)) return { kind: 'dismissed' };
  const paymentId = asText(response.easepayid);
  const signature = asText(response.hash);
  if (asText(response.txnid) === txnid && paymentId && signature) {
    return { kind: 'completed', gatewayResponse: { orderId: txnid, paymentId, signature } };
  }
  return { kind: 'finished' };
}
