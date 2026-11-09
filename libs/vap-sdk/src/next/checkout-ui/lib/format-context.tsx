'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { formatMoney, formatPaidAt } from './format.js';
import { DEFAULT_CHECKOUT_LOCALE } from './locale.js';

// The locale amounts and dates are shown in on the checkout pages: the shopper's browser locale, read from their
// Accept-Language by the pages, else the fallback in locale.ts. No currency or country is assumed: the currency comes
// with each amount

const LocaleContext = createContext(DEFAULT_CHECKOUT_LOCALE);

export const CheckoutLocaleProvider = ({ locale, children }: { locale?: string; children: ReactNode }) => (
  <LocaleContext.Provider value={locale || DEFAULT_CHECKOUT_LOCALE}>{children}</LocaleContext.Provider>
);

// The formatters, bound to the page's locale
export function useFormat() {
  const locale = useContext(LocaleContext);
  return useMemo(
    () => ({
      formatMoney: (money: { currency: string; value: string } | null | undefined) => formatMoney(money, locale),
      formatPaidAt: (iso: string) => formatPaidAt(iso, locale),
    }),
    [locale],
  );
}
