'use client';

import type { Checkout } from '@vritti/vap-sdk';
import type { CheckoutPlugin } from '@vritti/vap-sdk/checkout';
import { useCallback, useState } from 'react';
import type { CheckoutPaths } from '../types.js';
import { useCancelCheckout, usePayCheckout } from './checkout-mutations.js';

export type UseVapCheckoutOptions = {
  plugins: readonly CheckoutPlugin[];
  paths: CheckoutPaths;
  // Shown on the gateway's page
  brandName: string;
  // The checkout the storefront cart's Checkout button made, which the page is opened on
  initialCheckout: Checkout;
};

// The checkout page's behaviour without its looks, for a storefront that draws its own page: the checkout as it now
// stands, `pay` (a payment intent, then the gateway), `cancel` (then back to the cart), `replace` after a write such as
// a changed address, and `discard` once its window closed on the page
export function useVapCheckout(options: UseVapCheckoutOptions) {
  const { plugins, paths, brandName, initialCheckout } = options;
  const [checkout, setCheckout] = useState<Checkout | null>(initialCheckout);
  const pay = usePayCheckout(initialCheckout.id, { plugins, paths, brandName });
  const cancel = useCancelCheckout(initialCheckout.id, paths);

  const discard = useCallback(() => {
    setCheckout(null);
    window.history.replaceState(null, '', paths.checkout);
  }, [paths.checkout]);

  return { checkout, replace: setCheckout, pay, cancel, discard };
}
