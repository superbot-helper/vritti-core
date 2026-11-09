import { cashfree } from '@vritti/vap-sdk/cashfree';
import { type CheckoutPlugin, paymentMethodsOf, pluginFor } from '@vritti/vap-sdk/checkout';
import { easebuzz } from '@vritti/vap-sdk/easebuzz';
import { hdfc } from '@vritti/vap-sdk/hdfc';
import { razorpay } from '@vritti/vap-sdk/razorpay';

// The gateways the VAP checkout page can open; a gateway core offers but none of these opens is left off the page
export const VAP_CHECKOUT_PLUGINS: readonly CheckoutPlugin[] = [
  /*#__PURE__*/ razorpay(),
  /*#__PURE__*/ hdfc(),
  /*#__PURE__*/ cashfree(),
  /*#__PURE__*/ easebuzz(),
];

// The gateways of a list this page can open
export function openableGateways(gateways: readonly string[]): string[] {
  return gateways.filter((code) => pluginFor(code, VAP_CHECKOUT_PLUGINS));
}

// The payment methods a gateway's page takes, as its plugin declares them
export function methodsOf(gatewayCode: string): readonly string[] {
  return paymentMethodsOf(gatewayCode, VAP_CHECKOUT_PLUGINS);
}
