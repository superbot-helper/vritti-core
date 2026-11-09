'use server';

import {
  type Checkout,
  type GatewayResponse,
  type PaymentCheckout,
  type PaymentIntent,
  type PaymentIntentStatus,
  VapError,
} from '@vritti/vap-sdk';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentParty, requireParty } from './party.js';
import { resolvePayload } from './payload-adapter.js';
import { formField, type PartyActionState, returnToFrom, withPartyErrors } from './state.js';
import { vapSdk } from './visitor-session.js';

// Paying for a cart, as server actions a storefront imports directly.

// A checkout frozen from the cart, or why it could not be
export type StartCheckoutActionState = {
  error?: string;
  checkout?: Checkout;
};

// A payment opened for a checkout: its id, and what the gateway plugin opens (null when nothing is left to open —
// the payment already settled)
export type PayCheckoutActionState = {
  error?: string;
  paymentIntentId?: string;
  status?: PaymentIntentStatus;
  launch?: PaymentCheckout | null;
};

export type CheckoutStatusActionState = {
  error?: string;
  checkout?: Checkout;
};

export type ConfirmPaymentActionState = {
  error?: string;
  status?: PaymentIntentStatus;
  orderNumber?: string;
};

export type PaymentIntentActionState = {
  error?: string;
  paymentIntent?: PaymentIntent;
};

export type CancelPaymentActionState = PartyActionState & {
  status?: PaymentIntentStatus;
};

const MAX_KEY_LENGTH = 100;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Freezes the signed-in party's cart — every store it holds lines at, or the one `siteId` names — into a checkout. No
// payment is opened: the shopper picks the gateway and method next, and `payCheckoutAction` opens it. Pressing
// Continue twice with the same key reaches the same checkout
export async function startCheckoutAction(input: {
  idempotencyKey: string;
  siteId?: string;
  addressId?: string;
  // Where a sign-in, should the session have lapsed, brings the party back to
  returnTo?: string;
}): Promise<StartCheckoutActionState> {
  const party = await requireParty(localPath(input?.returnTo ?? '') ?? '/checkout');
  if (!isId(input?.idempotencyKey)) {
    return { error: 'This checkout could not be started. Reload the page and try again.' };
  }
  const siteId = optionalUuid(input.siteId);
  const addressId = optionalUuid(input.addressId);
  if (siteId === null || addressId === null) return { error: 'This checkout could not be started.' };

  const payload = await resolvePayload();
  return withPartyErrors<StartCheckoutActionState>(payload, async () => ({
    checkout: await (await vapSdk(payload, { partyId: party.partyId })).checkout.start({
      idempotencyKey: input.idempotencyKey,
      ...(siteId ? { siteId } : {}),
      ...(addressId ? { addressId } : {}),
    }),
  }));
}

// The cart's Checkout button: freezes the signed-in party's cart — the one store the form's `siteId` names, else every
// store — into a checkout delivered to their default address, then opens the VAP checkout page on it
// (`checkoutPath`, default /checkout, with ?checkout=<id>). Its 30-minute window starts here. A plain form action, so
// it works with JavaScript off; a failure lands on the checkout page with ?error= saying why
export async function beginCheckoutAction(formData: FormData): Promise<void> {
  const checkoutPath = localPath(formField(formData, 'checkoutPath')) ?? '/checkout';
  const siteId = optionalUuid(formField(formData, 'siteId'));
  const party = await requireParty(siteId ? `${checkoutPath}?site=${siteId}` : checkoutPath);
  if (siteId === null) redirect(`${checkoutPath}?error=${encodeURIComponent('That store could not be found.')}`);

  const payload = await resolvePayload();
  let target: string;
  try {
    const sdk = await vapSdk(payload, { partyId: party.partyId });
    const addresses = await sdk.people.addresses();
    const address = addresses.find((entry) => entry.isDefault) ?? addresses[0];
    const checkout = await sdk.checkout.start({
      idempotencyKey: globalThis.crypto.randomUUID(),
      ...(siteId ? { siteId } : {}),
      ...(address ? { addressId: address.id } : {}),
    });
    target = `${checkoutPath}?checkout=${encodeURIComponent(checkout.id)}`;
  } catch (error) {
    payload.logger?.error({ err: error }, 'Could not start a checkout');
    // Core's refusals are written for the shopper; anything else is not theirs to read
    const message = error instanceof VapError ? error.message : 'Checkout could not be started. Try again in a moment.';
    target = `${checkoutPath}?error=${encodeURIComponent(message.slice(0, 200))}${siteId ? `&site=${siteId}` : ''}`;
  }
  // Outside the try: a redirect is thrown, and must reach Next rather than be caught as a failure
  redirect(target);
}

// Opens a payment for one of the party's checkouts through the gateway and method they picked, and answers what the
// gateway plugin opens. Every press of Pay is its own payment (its own key); an earlier one still waiting is cancelled
// by core. The gateway brings the shopper back to `returnPath` (default /checkout/return) once paid, or to
// `checkoutPath` (default /checkout) after a decline or a cancel — each with ?checkout=<id>
export async function payCheckoutAction(input: {
  checkoutId: string;
  gatewayCode: string;
  paymentMethod?: string;
  idempotencyKey: string;
  returnPath?: string;
  checkoutPath?: string;
}): Promise<PayCheckoutActionState> {
  const checkoutPath = localPath(input?.checkoutPath ?? '') ?? '/checkout';
  const returnPath = localPath(input?.returnPath ?? '') ?? '/checkout/return';
  const party = await requireParty(checkoutPath);
  if (!UUID.test(input?.checkoutId ?? '') || !isId(input.gatewayCode) || !isId(input.idempotencyKey)) {
    return { error: 'This payment could not be started. Reload the page and try again.' };
  }
  const paymentMethod =
    typeof input.paymentMethod === 'string' && /^[a-z_]{2,30}$/.test(input.paymentMethod)
      ? input.paymentMethod
      : undefined;

  const origin = await requestOrigin();
  const back = (path: string) => (origin ? withCheckout(`${origin}${path}`, input.checkoutId) : undefined);
  const payload = await resolvePayload();
  return withPartyErrors<PayCheckoutActionState>(payload, async () => {
    const intent = await (await vapSdk(payload, { partyId: party.partyId })).payments.createPaymentIntent({
      checkoutId: input.checkoutId,
      gatewayCode: input.gatewayCode,
      ...(paymentMethod ? { paymentMethod } : {}),
      idempotencyKey: input.idempotencyKey,
      returnUrl: back(returnPath),
      checkoutUrl: back(checkoutPath),
    });
    return { paymentIntentId: intent.id, status: intent.status, launch: intent.checkout };
  });
}

// `url` with ?checkout=<id>, keeping whatever query it already has
function withCheckout(url: string, checkoutId: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}checkout=${encodeURIComponent(checkoutId)}`;
}

// A UUID, nothing when left out, or null when it is not one
function optionalUuid(value: unknown): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined;
  return typeof value === 'string' && UUID.test(value) ? value : null;
}

// Delivers one of the signed-in party's open checkouts to another of their saved addresses — the address dialog's
// "Deliver here". Answers the updated checkout, or why it could not change
export async function changeCheckoutAddressAction(
  checkoutId: string,
  addressId: string,
): Promise<StartCheckoutActionState> {
  if (!UUID.test(checkoutId ?? '') || !UUID.test(addressId ?? '')) {
    return { error: 'Choose one of your saved addresses.' };
  }
  const party = await requireParty('/checkout');
  const payload = await resolvePayload();
  return withPartyErrors<StartCheckoutActionState>(payload, async () => ({
    checkout: await (await vapSdk(payload, { partyId: party.partyId })).checkout.changeAddress(checkoutId, addressId),
  }));
}

// Changes who one of the signed-in party's open checkouts is for — the contact dialog's Save. The checkout's own
// name, phone and email change; the party's profile does not
export async function changeCheckoutContactAction(
  checkoutId: string,
  input: { name: string; phone: string; email?: string },
): Promise<StartCheckoutActionState> {
  if (!UUID.test(checkoutId ?? '')) return { error: 'No such checkout.' };
  const name = typeof input?.name === 'string' ? input.name.trim().slice(0, 255) : '';
  const phone = typeof input?.phone === 'string' ? input.phone.trim() : '';
  const email = typeof input?.email === 'string' ? input.email.trim().slice(0, 200) : '';
  if (!name) return { error: 'Enter the name the order is for.' };
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) return { error: 'Enter a phone number with its country code.' };
  const party = await requireParty('/checkout');
  const payload = await resolvePayload();
  return withPartyErrors<StartCheckoutActionState>(payload, async () => ({
    checkout: await (await vapSdk(payload, { partyId: party.partyId })).checkout.changeContact(checkoutId, {
      name,
      phone,
      ...(email ? { email } : {}),
    }),
  }));
}

// Ends one of the signed-in party's open checkouts — the Cancel beside Pay. `ok` once it is cancelled (or had already
// ended), else the reason, e.g. a payment already under way
export async function cancelCheckoutAction(checkoutId: string): Promise<PartyActionState> {
  if (!UUID.test(checkoutId ?? '')) return { error: 'No such checkout.' };
  const party = await requireParty('/checkout');
  const payload = await resolvePayload();
  return withPartyErrors(payload, async () => {
    await (await vapSdk(payload, { partyId: party.partyId })).checkout.cancel(checkoutId);
    return { ok: true };
  });
}

// One read of a checkout — its payment and the orders it became — for a return page.
export async function getCheckoutAction(checkoutId: string): Promise<CheckoutStatusActionState> {
  if (!isId(checkoutId)) return { error: 'No such checkout.' };

  const party = await getCurrentParty();
  const payload = await resolvePayload();
  return withPartyErrors<CheckoutStatusActionState>(payload, async () => ({
    checkout: await (await vapSdk(payload, party?.partyId ? { partyId: party.partyId } : {})).checkout.find(checkoutId),
  }));
}

// The signed-in party's open, live checkout, or null — for the storefront's "checkout in progress" card. Null for a
// visitor who is not signed in, and when core cannot be reached (the card simply does not show)
export async function getActiveCheckoutAction(): Promise<{ checkout: Checkout | null }> {
  const party = await getCurrentParty();
  if (!party?.partyId) return { checkout: null };
  const payload = await resolvePayload();
  try {
    return { checkout: await (await vapSdk(payload, { partyId: party.partyId })).checkout.active() };
  } catch {
    return { checkout: null };
  }
}

// Hands what the gateway's modal resolved to core and answers the intent's status.
export async function confirmPaymentAction(input: {
  paymentIntentId: string;
  gatewayResponse: GatewayResponse;
  orderNumber?: string;
}): Promise<ConfirmPaymentActionState> {
  const { paymentIntentId, gatewayResponse, orderNumber } = input ?? {};
  const valid =
    isId(paymentIntentId) &&
    isId(gatewayResponse?.orderId) &&
    isId(gatewayResponse?.paymentId) &&
    isId(gatewayResponse?.signature);
  if (!valid) return { error: 'That payment could not be confirmed.' };

  const party = await getCurrentParty();
  const payload = await resolvePayload();
  const result = await withPartyErrors<ConfirmPaymentActionState>(payload, async () => {
    const sdk = await vapSdk(payload, party?.partyId ? { partyId: party.partyId } : {});
    const intent = await sdk.payments.confirmPayment({
      paymentIntentId,
      gatewayResponse: {
        orderId: gatewayResponse.orderId,
        paymentId: gatewayResponse.paymentId,
        signature: gatewayResponse.signature,
      },
    });
    return {
      status: intent.status,
      ...(typeof orderNumber === 'string' && orderNumber ? { orderNumber } : {}),
    };
  });

  // The cart was emptied into the order, and the header's count renders on every page.
  if (result.status === 'SUCCEEDED' || result.status === 'PROCESSING') revalidatePath('/', 'layout');
  return result;
}

// One read of an intent — what a return page shows.
export async function getPaymentIntentAction(paymentIntentId: string): Promise<PaymentIntentActionState> {
  if (!isId(paymentIntentId)) return { error: 'No such payment.' };

  const party = await getCurrentParty();
  const payload = await resolvePayload();
  return withPartyErrors<PaymentIntentActionState>(payload, async () => ({
    paymentIntent: await (
      await vapSdk(payload, party?.partyId ? { partyId: party.partyId } : {})
    ).payments.paymentIntent(paymentIntentId),
  }));
}

// Abandons a payment the party has not made — "cancel this order" on an unpaid one.
export async function cancelPaymentAction(
  _previous: CancelPaymentActionState,
  formData: FormData,
): Promise<CancelPaymentActionState> {
  const returnTo = returnToFrom(formData);
  const party = await requireParty(returnTo);
  const paymentIntentId = formField(formData, 'paymentIntentId');
  if (!isId(paymentIntentId)) return { error: 'No such payment.' };

  const payload = await resolvePayload();
  const result = await withPartyErrors<CancelPaymentActionState>(payload, async () => {
    const intent = await (await vapSdk(payload, { partyId: party.partyId })).payments.cancelPaymentIntent(
      paymentIntentId,
    );
    return { ok: true, status: intent.status };
  });
  revalidatePath(returnTo);
  return result;
}

// The origin the party is on — where core should send them back to.
async function requestOrigin(): Promise<string | undefined> {
  const list = await headers();
  const origin = list.get('origin');
  if (origin && origin !== 'null') return origin;
  const host = list.get('x-forwarded-host') ?? list.get('host');
  if (!host) return undefined;
  const proto = list.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
  return `${proto}://${host}`;
}

// A path on this storefront, or undefined — never `//other.site` or a full URL, which would leave it.
function localPath(value: string): string | undefined {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : undefined;
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_KEY_LENGTH;
}
