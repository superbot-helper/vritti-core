// An amount as core sends it — `{ currency, value }`, value the major-unit decimal string carrying exactly the
// currency's own number of minor digits ("2228.50" INR, "1200" JPY, "1.250" BHD) — in the shopper's locale. The
// digits come from the value, so no currency is assumed: a three-digit currency shows three
export function formatMoney(money: { currency: string; value: string } | null | undefined, locale: string): string {
  if (!money) return '—';
  const amount = Number(money.value);
  const digits = money.value.split('.')[1]?.length ?? 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    // A currency code Intl does not know: the code and the amount as sent
    return `${money.currency} ${money.value}`;
  }
}

// When a payment was made, e.g. "4 Nov 2026, 2:41 pm" in en-IN
export function formatPaidAt(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

// "24:13" for a remaining time in milliseconds; "1:05:09" past an hour
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = (total % 60).toString().padStart(2, '0');
  return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
}

export function pluralize(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
