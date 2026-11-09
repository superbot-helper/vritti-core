import type { PaymentMoneyResponseDto } from './payment-intent-response.dto';

export type CheckoutStatusValue = 'OPEN' | 'PAID' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';

// One store's share of a checkout — what its payout leg is sized from
export interface CheckoutStoreShareResponseDto {
  siteId: string;
  legalEntityId: string;
  subtotalMinor: string;
}

// One order a checkout became, at one store
export interface CheckoutStoreOrderResponseDto {
  siteId: string;
  orderId: string;
  orderNumber: string;
  // The payment intent that paid it
  paymentIntentId: string | null;
}

// What commerce answers `org.checkouts.start` with
export interface CheckoutStartedResponseDto {
  checkoutId: string;
  status: CheckoutStatusValue;
  currencyCode: string;
  total: PaymentMoneyResponseDto;
  totalMinor: string;
  expiresAt: string;
  customer: { name: string | null; phone: string | null; email: string | null } | null;
  sites: CheckoutStoreShareResponseDto[];
  reused: boolean;
}

// What commerce answers `org.checkouts.get`, `complete` and `cancel` with
export interface CheckoutStatusResponseDto {
  checkoutId: string;
  status: CheckoutStatusValue;
  currencyCode: string;
  total: PaymentMoneyResponseDto;
  totalMinor: string;
  expiresAt: string;
  paidAt: string | null;
  customer: { name: string | null; phone: string | null; email: string | null };
  partyAddressId: string | null;
  sites: CheckoutStoreShareResponseDto[];
  orders: CheckoutStoreOrderResponseDto[];
}
