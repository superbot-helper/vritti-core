import { CheckoutError, type CheckoutOutcome, type CheckoutPlugin, type PaymentCheckout } from './index.js';
import { asRecord, asText, type CheckoutMode, checkoutModeOf, loadScript, requireBrowser } from './shared.js';

// Cashfree Payments — `@vritti/vap-sdk/cashfree`.
//
// Opens Cashfree's checkout for the payment session core created with the order, as the gateway config says: on
// Cashfree's page, which comes back to the store's return page (HOSTED), or in Cashfree's popup on the store's page
// (MODAL). Either way the payment is completed by Cashfree's signed webhook to core, so the browser never reports a
// result.

export const CASHFREE_SCRIPT_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

export type CashfreeMode = 'sandbox' | 'production';

export type CashfreeSession = {
  paymentSessionId: string;
  orderId: string;
  mode: CashfreeMode;
  checkoutMode: CheckoutMode;
};

// What Cashfree's popup resolves with: an error when it was closed or the payment failed, a redirect when it could not
// open as a popup (an in-app browser) and is taking the shopper to the return page instead, or the payment's details
// once Cashfree has an outcome, whatever it is
type CashfreePopupResult = { error?: unknown; redirect?: unknown; paymentDetails?: unknown };

type CashfreeInstance = {
  checkout(options: { paymentSessionId: string; redirectTarget: '_self' | '_modal' }): Promise<unknown>;
};
type CashfreeFactory = (options: { mode: CashfreeMode }) => CashfreeInstance;

// What core's payload carries for a Cashfree checkout
export function cashfreeSession(checkout: PaymentCheckout): CashfreeSession {
  if (checkout.gateway.toLowerCase() !== 'cashfree') {
    throw new CheckoutError(`This storefront cannot open a "${checkout.gateway}" Cashfree checkout.`);
  }
  const paymentSessionId = asText(checkout.options.payment_session_id);
  const orderId = asText(checkout.options.order_id);
  if (!paymentSessionId || !orderId) {
    throw new CheckoutError('This payment has no gateway order to pay, so its checkout cannot be opened.');
  }
  const mode: CashfreeMode = checkout.options.mode === 'production' ? 'production' : 'sandbox';
  return { paymentSessionId, orderId, mode, checkoutMode: checkoutModeOf(checkout.options) ?? 'HOSTED' };
}

// The Cashfree plugin
export function cashfree(): CheckoutPlugin {
  return {
    gateways: ['cashfree'],
    methods: ['upi', 'card', 'netbanking', 'wallet'],
    async open(checkout) {
      const session = cashfreeSession(checkout);
      requireBrowser('Opening the Cashfree checkout');
      try {
        await loadScript(CASHFREE_SCRIPT_URL);
      } catch (error) {
        throw new CheckoutError((error as Error).message);
      }
      const factory = Reflect.get(window, 'Cashfree') as CashfreeFactory | undefined;
      if (typeof factory !== 'function') {
        throw new CheckoutError('The payment window could not be loaded. Check your connection and try again.');
      }
      const cashfree = factory({ mode: session.mode });
      if (session.checkoutMode === 'MODAL') {
        return popupOutcome(
          await cashfree.checkout({ paymentSessionId: session.paymentSessionId, redirectTarget: '_modal' }),
        );
      }
      // Resolves only if the page could not be left; normally the browser is already on its way to Cashfree
      await cashfree.checkout({ paymentSessionId: session.paymentSessionId, redirectTarget: '_self' });
      return { kind: 'redirected' };
    },
  };
}

// What the popup's result means for the checkout page. Details mean Cashfree reached an outcome, which its webhook
// settles; a redirect means the page is leaving; anything else (an error) means it closed without a payment
function popupOutcome(value: unknown): CheckoutOutcome {
  const result: CashfreePopupResult = asRecord(value);
  if (result.paymentDetails) return { kind: 'finished' };
  if (result.redirect) return { kind: 'redirected' };
  return { kind: 'dismissed' };
}
