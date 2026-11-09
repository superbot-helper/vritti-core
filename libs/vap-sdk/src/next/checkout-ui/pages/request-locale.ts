import { headers } from 'next/headers';
import { DEFAULT_CHECKOUT_LOCALE } from '../lib/locale.js';

// The shopper's locale from their browser: the `Accept-Language` header it sends with every request, e.g.
// "en-IN,en;q=0.9,hi;q=0.8". Read on the server, so the server render and the browser format amounts and dates the same
// way — no flash, no hydration mismatch. The first tag (by q-value) that Intl can format wins; else "en"
export async function requestLocale(): Promise<string> {
  const header = (await headers()).get('accept-language') ?? '';
  const tags = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((param) => param.trim()).find((param) => param.startsWith('q='));
      return { tag: tag.trim(), q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter(({ tag, q }) => tag && tag !== '*' && Number.isFinite(q) && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of tags) {
    try {
      if (Intl.NumberFormat.supportedLocalesOf(tag).length > 0) return tag;
    } catch {
      // A malformed tag: try the next one
    }
  }
  return DEFAULT_CHECKOUT_LOCALE;
}
