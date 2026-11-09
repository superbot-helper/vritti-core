import type { PaymentIntent } from '@vritti/vap-sdk';
import type { PaymentFormData } from '../schemas/checkout.js';
import { methodsOf } from './plugins.js';

// What the payment form starts on: the gateway last tried when still on offer, else the first; its method last tried,
// else the gateway's first
export function paymentDefaults(gateways: string[], last: PaymentIntent | null): PaymentFormData {
  const gatewayCode = last && gateways.includes(last.gatewayCode) ? last.gatewayCode : (gateways[0] ?? '');
  const methods = gatewayCode ? methodsOf(gatewayCode) : [];
  const paymentMethod =
    last?.method && last.gatewayCode === gatewayCode && methods.includes(last.method)
      ? last.method
      : (methods[0] ?? '');
  return { gatewayCode, paymentMethod };
}
