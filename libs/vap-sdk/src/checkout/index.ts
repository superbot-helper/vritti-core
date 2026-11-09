import type { GatewayResponse, PaymentCheckout } from '../core/domains/payments.js';

// Opening a gateway's checkout in the browser — `@vritti/vap-sdk/checkout`.
//
// Core and payments-service do the server work (the order, the split, the keys, the verification); a plugin only
// opens the payment page from the public payload core returns with the intent. A storefront registers the plugins
// of the gateways it offers:
//
//   import { openCheckout } from '@vritti/vap-sdk/checkout';
//   import { razorpay } from '@vritti/vap-sdk/razorpay';
//   import { hdfc } from '@vritti/vap-sdk/hdfc';
//   await openCheckout(session.paymentIntent.checkout, { name: 'Store' }, [razorpay(), hdfc()]);

export type { GatewayResponse, PaymentCheckout };

// ── Failures ─────────────────────────────────────────────────────────────────────────────────────

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutError';
  }
}

export class CheckoutDismissedError extends CheckoutError {
  constructor() {
    super('The checkout was closed before payment completed.');
    this.name = 'CheckoutDismissedError';
  }
}

export class CheckoutFailedError extends CheckoutError {
  constructor(
    readonly code: string | undefined,
    readonly description: string | undefined,
    readonly reason?: string,
  ) {
    super(description ?? 'The payment did not go through.');
    this.name = 'CheckoutFailedError';
  }
}

// ── Contract ─────────────────────────────────────────────────────────────────────────────────────

export type OpenCheckoutOptions = {
  // Shown on the payment page
  name?: string;
  description?: string;
  image?: string;
  theme?: { color?: string };
  notes?: Record<string, string>;
  callbackUrl?: string;
  cancelUrl?: string;
};

// What opening a checkout led to
export type CheckoutOutcome =
  // The page left for the gateway's; core's callback finishes the payment and returns the shopper to the store
  | { kind: 'redirected' }
  // A payment window on this page completed; hand the response to `confirmPaymentAction`
  | { kind: 'completed'; gatewayResponse: GatewayResponse }
  // A payment window on this page closed after the gateway took the payment, with nothing for the browser to confirm:
  // the gateway's webhook settles it, so go to the result page and let it wait
  | { kind: 'finished' }
  // The shopper closed the payment window without paying
  | { kind: 'dismissed' };

// The ways a shopper can pay, as the checkout page offers them; the gateway's own page opens on the one chosen
export type PaymentMethodCode = 'upi' | 'card' | 'netbanking' | 'wallet';

// One gateway's way of opening its payment page
export interface CheckoutPlugin {
  // The `checkout.gateway` codes this plugin opens
  readonly gateways: readonly string[];
  // The methods its payment page takes, in the order the checkout page offers them
  readonly methods?: readonly PaymentMethodCode[];
  open(checkout: PaymentCheckout, options: OpenCheckoutOptions): Promise<CheckoutOutcome>;
}

// Opens the checkout of an intent through the plugin that handles its gateway
export function openCheckout(
  checkout: PaymentCheckout,
  options: OpenCheckoutOptions,
  plugins: readonly CheckoutPlugin[],
): Promise<CheckoutOutcome> {
  const gateway = checkout.gateway.toLowerCase();
  const plugin = plugins.find((candidate) => candidate.gateways.includes(gateway));
  if (!plugin) {
    return Promise.reject(new CheckoutError(`This store cannot open a "${checkout.gateway}" checkout yet.`));
  }
  return plugin.open(checkout, options);
}

// The plugin that opens a gateway, if any
export function pluginFor(gateway: string, plugins: readonly CheckoutPlugin[]): CheckoutPlugin | undefined {
  const code = gateway.toLowerCase();
  return plugins.find((candidate) => candidate.gateways.includes(code));
}

// The methods a gateway's page takes, as its plugin declares them; empty when no plugin opens it
export function paymentMethodsOf(gateway: string, plugins: readonly CheckoutPlugin[]): readonly PaymentMethodCode[] {
  return pluginFor(gateway, plugins)?.methods ?? [];
}

// How a gateway's code reads to a shopper
const GATEWAY_NAMES: Record<string, string> = {
  razorpay: 'Razorpay',
  'hdfc-razorpay': 'HDFC SmartGateway',
  cashfree: 'Cashfree',
  easebuzz: 'Easebuzz',
};

// A gateway's name for the shopper, else its code as given
export function gatewayName(code: string): string {
  return GATEWAY_NAMES[code.toLowerCase()] ?? code;
}

// How a method's code reads to a shopper
const METHOD_NAMES: Record<PaymentMethodCode, { title: string; hint: string }> = {
  upi: { title: 'UPI', hint: 'Google Pay, PhonePe, Paytm or any UPI app' },
  card: { title: 'Card', hint: 'Credit or debit card' },
  netbanking: { title: 'Netbanking', hint: 'All major banks' },
  wallet: { title: 'Wallet', hint: 'Paytm, Amazon Pay and other wallets' },
};

// A method's title and hint for the shopper, else its code with no hint
export function paymentMethodName(code: string): { title: string; hint: string } {
  return METHOD_NAMES[code as PaymentMethodCode] ?? { title: code, hint: '' };
}
