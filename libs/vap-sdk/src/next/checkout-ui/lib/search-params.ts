// The query keys each checkout page reads. Values are whatever the URL holds — the shopper can edit it — so each is
// validated before use. Next's own `searchParams` is assignable to both.

type QueryValue = string | string[] | undefined;

// /checkout — `checkout` the checkout to show; `payment` and `message` from a gateway sending the shopper back after a
// decline or a cancel; `error` from a start that failed; `site` the one store a fresh start is for
export type CheckoutSearchParams = {
  checkout?: QueryValue;
  payment?: QueryValue;
  message?: QueryValue;
  error?: QueryValue;
  site?: QueryValue;
};

// /checkout/return — `checkout` the checkout; `intent` and `order` from the gateway's return
export type CheckoutResultSearchParams = {
  checkout?: QueryValue;
  intent?: QueryValue;
  order?: QueryValue;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The first value, trimmed, or undefined
export function firstValue(value: QueryValue): string | undefined {
  const text = (Array.isArray(value) ? value[0] : value)?.trim();
  return text || undefined;
}

// The first value when it is a UUID, else undefined
export function uuidValue(value: QueryValue): string | undefined {
  const text = firstValue(value);
  return text && UUID.test(text) ? text : undefined;
}
