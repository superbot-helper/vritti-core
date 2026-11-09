// How gateways and payment methods read on the VAP checkout page
import { CreditCard, Landmark, type LucideIcon, Smartphone, Wallet } from 'lucide-react';

// The gateway's name comes from the plugins' own map, so the page and the plugins never disagree
export { gatewayName } from '@vritti/vap-sdk/checkout';

// The badge shown for a gateway with no logo
const GATEWAY_SHORT: Readonly<Record<string, string>> = {
  razorpay: 'Rz',
  'hdfc-razorpay': 'HD',
  cashfree: 'Cf',
  easebuzz: 'Eb',
};

// A gateway's two-letter mark, e.g. "Rz"
export function gatewayShort(code: string): string {
  return GATEWAY_SHORT[code] ?? code.slice(0, 2).toUpperCase();
}

export interface MethodMeta {
  code: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

// Fixed order: UPI first, then card, netbanking, wallets
export const METHODS: readonly MethodMeta[] = [
  { code: 'upi', title: 'UPI', subtitle: 'Approve in your UPI app in seconds', icon: Smartphone },
  { code: 'card', title: 'Card', subtitle: 'Credit or debit', icon: CreditCard },
  { code: 'netbanking', title: 'Netbanking', subtitle: 'Pay from your bank', icon: Landmark },
  { code: 'wallet', title: 'Wallets', subtitle: 'Paytm, PhonePe and more', icon: Wallet },
];

// A method's title, e.g. "UPI"; null for none or one this page does not list
export function methodTitle(code: string | null | undefined): string | null {
  return METHODS.find((method) => method.code === code)?.title ?? null;
}

// A gateway's refusal in plain words; its own message when it gave one a shopper can read
export function failureInWords(failure: { code?: string | null; message?: string | null } | null | undefined): string {
  const text = `${failure?.code ?? ''} ${failure?.message ?? ''}`.toLowerCase();
  if (/declin|rejected by bank|do not honou?r/.test(text)) return 'Your bank declined the payment.';
  if (/insufficient/.test(text)) return 'There was not enough balance for this payment.';
  if (/otp|authenticat|3ds/.test(text)) return 'The payment could not be verified with your bank.';
  if (/cancel|dropped|closed/.test(text)) return 'The payment was cancelled before it finished.';
  if (/timeout|timed out/.test(text)) return 'The payment took too long and was stopped.';
  return failure?.message?.trim() || 'The payment did not go through.';
}
