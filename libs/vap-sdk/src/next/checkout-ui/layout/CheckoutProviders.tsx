'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type FC, type ReactNode, useState } from 'react';
import { CheckoutLocaleProvider } from '../lib/format-context.js';

interface CheckoutProvidersProps {
  // BCP 47 locale for amounts and dates
  locale?: string;
  children: ReactNode;
}

// What every checkout screen runs inside: the checkout's own React Query client — so a storefront needs no setup — and
// the locale its amounts and dates are shown in. The pages render it above the screens, whose hooks need both
export const CheckoutProviders: FC<CheckoutProvidersProps> = ({ locale, children }) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <CheckoutLocaleProvider locale={locale}>{children}</CheckoutLocaleProvider>
    </QueryClientProvider>
  );
};
