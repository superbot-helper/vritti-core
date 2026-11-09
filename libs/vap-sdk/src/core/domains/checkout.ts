import type { ApolloClient } from '@apollo/client';
import { VapError } from '../errors.js';
import type { CheckoutFieldsFragment } from '../gql/graphql.js';
import {
  ACTIVE_CHECKOUT,
  CANCEL_CHECKOUT,
  CHANGE_CHECKOUT_ADDRESS,
  CHANGE_CHECKOUT_CONTACT,
  CHECKOUT_QUERY,
  START_CHECKOUT,
} from '../graphql/checkout.js';
import { requireData, run } from '../transport/errors.js';
import { contextForScope, type Money, type RequestContext } from '../types.js';
import { type PaymentIntent, toPaymentIntent } from './payments.js';

// The reference type core stamps on the payment intent of a checkout — an intent whose `reference.type` is this
// names its checkout in `reference.id`, which is how a return page reached from the gateway finds the orders
export const CHECKOUT_REFERENCE_TYPE = 'commerce.checkout';

// OPEN: awaiting payment. PAID: the payment landed, orders being made. CONVERTED: one order per store exists.
// EXPIRED: its 30-minute window closed unpaid. CANCELLED: the shopper cancelled it
export type CheckoutStatus = 'OPEN' | 'PAID' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';

// One store's share of a checkout
export type CheckoutStoreShare = { siteId: string; legalEntityId: string; subtotal: Money };

// One order a checkout became, at one store
export type CheckoutStoreOrder = { siteId: string; orderId: string; orderNumber: string };

// Who the checkout's orders are for, as the checkout holds them: copied from the party when it opened, changed with
// `changeContact`. The gateway's page is prefilled from these
export type CheckoutCustomer = { name: string | null; phone: string | null; email: string | null };

export type CheckoutContactInput = {
  name: string;
  // In international form, e.g. +919876543210
  phone: string;
  email?: string;
};

// The cart frozen at checkout — every store, or one — and what it has become. A payment intent is opened for it with
// `payments.createPaymentIntent({ checkoutId, … })` when the shopper presses Pay; one of them pays it
export type Checkout = {
  id: string;
  status: CheckoutStatus;
  currencyCode: string;
  total: Money;
  sites: CheckoutStoreShare[];
  // When the checkout closes unpaid (10 minutes after it opened); once closed — expired, cancelled or paid — when it did
  expiresAt: string;
  paidAt: string | null;
  // The party's saved address the orders go to; null for takeaway
  partyAddressId: string | null;
  customer: CheckoutCustomer;
  // Empty until the payment lands
  orders: CheckoutStoreOrder[];
  // The payment that paid it, else the latest one opened for it; null until Pay is pressed
  paymentIntent: PaymentIntent | null;
};

export type CheckoutStartInput = {
  // One store to check out on its own, one of the cart's `sites[].siteId`. Left out, every store the cart holds lines at
  siteId?: string;
  addressId?: string;
  // Ignored by core: the checkout is keyed by the cart itself, so the same cart reaches the same checkout
  idempotencyKey?: string;
};

// Core's checkout, reshaped for callers.
export function toCheckout(raw: CheckoutFieldsFragment, coreOrigin?: string): Checkout {
  return {
    id: raw.id,
    status: raw.status,
    currencyCode: raw.currencyCode,
    total: { currency: raw.total.currency, value: raw.total.value },
    sites: raw.sites.map((share) => ({
      siteId: share.siteId,
      legalEntityId: share.legalEntityId,
      subtotal: { currency: share.subtotal.currency, value: share.subtotal.value },
    })),
    expiresAt: raw.expiresAt,
    paidAt: raw.paidAt ?? null,
    partyAddressId: raw.partyAddressId ?? null,
    customer: {
      name: raw.customer.name ?? null,
      phone: raw.customer.phone ?? null,
      email: raw.customer.email ?? null,
    },
    orders: raw.orders.map((order) => ({
      siteId: order.siteId,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
    })),
    paymentIntent: raw.paymentIntent ? toPaymentIntent(raw.paymentIntent, coreOrigin) : null,
  };
}

// Checking a cart out: the checkout here, its payments through `payments.createPaymentIntent`.
export function createCheckoutOperations(
  client: ApolloClient,
  context: RequestContext = {},
  currency?: string,
  coreOrigin?: string,
) {
  const requireParty = (): void => {
    if (!context.partyId) {
      throw new VapError('This needs a signed-in party — use sdk.forContext({ partyId }).', 'No Party', 401);
    }
  };

  return {
    // Freezes the cart — every store, or one — into a checkout. No payment is opened: the shopper picks the gateway and
    // method, and Pay opens one with `payments.createPaymentIntent({ checkoutId })`. Each store's share is paid out to
    // that store's own account; the orders, one per store, are made once a payment lands.
    async start(input: CheckoutStartInput): Promise<Checkout> {
      requireParty();
      // Core prices every store's lines in one currency and takes the one payment in it
      if (!currency) {
        throw new VapError(
          'VAP is not configured for checkout — pass `currency` (e.g. "INR") to createVapSdk.',
          'Not Configured',
          undefined,
        );
      }
      // Asked for from the store the visitor is shopping at — the same header the cart is read under. Core reads the
      // whole cart regardless; the header is what its permission check resolves `site.payments.create` against, since
      // an organization-level request only ever carries `org.*` permissions
      const requestContext = { requestContext: contextForScope(context, 'site') };
      return run(() =>
        client
          .mutate({
            mutation: START_CHECKOUT,
            variables: {
              input: {
                currencyCode: currency,
                siteId: input.siteId,
                addressId: input.addressId,
                idempotencyKey: input.idempotencyKey,
              },
            },
            context: requestContext,
          })
          .then((r) => toCheckout(requireData(r.data).startCheckout, coreOrigin)),
      );
    },

    // Delivers one of the party's open checkouts to another of their saved addresses — the same checkout, its window
    // unchanged
    async changeAddress(checkoutId: string, addressId: string): Promise<Checkout> {
      requireParty();
      return run(() =>
        client
          .mutate({
            mutation: CHANGE_CHECKOUT_ADDRESS,
            variables: { input: { checkoutId, addressId } },
            context: { requestContext: contextForScope(context, 'site') },
          })
          .then((r) => toCheckout(requireData(r.data).changeCheckoutAddress, coreOrigin)),
      );
    },

    // Changes who one of the party's open checkouts is for — the name, phone and email it holds, for this order only.
    // The party's profile is left as it is
    async changeContact(checkoutId: string, input: CheckoutContactInput): Promise<Checkout> {
      requireParty();
      return run(() =>
        client
          .mutate({
            mutation: CHANGE_CHECKOUT_CONTACT,
            variables: { input: { checkoutId, name: input.name, phone: input.phone, email: input.email } },
            context: { requestContext: contextForScope(context, 'site') },
          })
          .then((r) => toCheckout(requireData(r.data).changeCheckoutContact, coreOrigin)),
      );
    },

    // Ends one of the party's open checkouts at the shopper's request; its payments still waiting on them are cancelled
    // too. One already ended answers as it is; one paid, or being paid, is refused
    async cancel(checkoutId: string): Promise<Checkout> {
      requireParty();
      return run(() =>
        client
          .mutate({
            mutation: CANCEL_CHECKOUT,
            variables: { input: { checkoutId } },
            // Under the visitor's store, like `start`, for the same permission check
            context: { requestContext: contextForScope(context, 'site') },
          })
          .then((r) => toCheckout(requireData(r.data).cancelCheckout, coreOrigin)),
      );
    },

    // The party's open, live checkout, or null — what a storefront's "checkout in progress" card shows. A party has
    // at most one
    async active(): Promise<Checkout | null> {
      requireParty();
      return run(() =>
        client
          .query({
            query: ACTIVE_CHECKOUT,
            context: { requestContext: contextForScope(context, 'site') },
            fetchPolicy: 'no-cache',
          })
          .then((r) => {
            const raw = requireData(r.data).activeCheckout;
            return raw ? toCheckout(raw, coreOrigin) : null;
          }),
      );
    },

    // Where one of the party's checkouts stands — its payment, and the orders it became — read fresh each time, which
    // is what a return page needs. Another party's checkout reads as not found.
    async find(checkoutId: string): Promise<Checkout> {
      requireParty();
      return run(() =>
        client
          .query({
            query: CHECKOUT_QUERY,
            variables: { input: { checkoutId } },
            // Under the visitor's store, like `start`, for the same permission check
            context: { requestContext: contextForScope(context, 'site') },
            fetchPolicy: 'no-cache',
          })
          .then((r) => toCheckout(requireData(r.data).checkout, coreOrigin)),
      );
    },
  };
}

export type CheckoutOperations = ReturnType<typeof createCheckoutOperations>;
