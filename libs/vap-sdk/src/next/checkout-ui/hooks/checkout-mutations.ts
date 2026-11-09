'use client';

import { useMutation } from '@tanstack/react-query';
import type { Checkout } from '@vritti/vap-sdk';
import { CheckoutError, type CheckoutPlugin, openCheckout } from '@vritti/vap-sdk/checkout';
import { useRouter } from 'next/navigation';
import {
  cancelCheckoutAction,
  changeCheckoutAddressAction,
  changeCheckoutContactAction,
  confirmPaymentAction,
  payCheckoutAction,
} from '../../payments-actions.js';
import type { CheckoutPaths } from '../types.js';

// React Query mutations over the checkout's server actions. Each throws the action's own message on failure, so a
// form or button shows it as-is.

// Delivers the checkout to another of the party's saved addresses — the same checkout, its window unchanged
export function useChangeCheckoutAddress(checkoutId: string, options: { onSuccess: (checkout: Checkout) => void }) {
  return useMutation({
    mutationFn: async ({ addressId }: { addressId: string }) => {
      const result = await changeCheckoutAddressAction(checkoutId, addressId);
      if (!result.checkout) throw new Error(result.error ?? 'The address could not be changed. Try again.');
      return result.checkout;
    },
    onSuccess: options.onSuccess,
  });
}

// Changes who the checkout's orders are for — the name, phone and email it holds, for this order only
export function useChangeCheckoutContact(checkoutId: string, options: { onSuccess: (checkout: Checkout) => void }) {
  return useMutation({
    mutationFn: async (input: { name: string; phone: string; email?: string }) => {
      const result = await changeCheckoutContactAction(checkoutId, input);
      if (!result.checkout) throw new Error(result.error ?? 'The contact could not be changed. Try again.');
      return result.checkout;
    },
    onSuccess: options.onSuccess,
  });
}

// What pressing Pay led to: the browser left for the gateway (or the result page), or the gateway window was closed
export type PayOutcome = 'leaving' | 'dismissed';

// Opens a payment intent for the checkout through the chosen gateway and method, then opens the gateway in the browser
export function usePayCheckout(
  checkoutId: string,
  options: { plugins: readonly CheckoutPlugin[]; paths: CheckoutPaths; brandName: string },
) {
  const router = useRouter();
  const { plugins, paths, brandName } = options;
  return useMutation({
    mutationFn: async ({
      gatewayCode,
      paymentMethod,
    }: {
      gatewayCode: string;
      paymentMethod?: string;
    }): Promise<PayOutcome> => {
      const opened = await payCheckoutAction({
        checkoutId,
        gatewayCode,
        paymentMethod,
        // Every press of Pay is its own payment
        idempotencyKey: globalThis.crypto.randomUUID(),
        returnPath: paths.result,
        checkoutPath: paths.checkout,
      });
      if (!opened.paymentIntentId) throw new Error(opened.error ?? 'The payment could not be opened. Try again.');
      const resultUrl = `${paths.result}?checkout=${encodeURIComponent(checkoutId)}&intent=${encodeURIComponent(opened.paymentIntentId)}`;
      // Nothing to open: the payment settled already. The result page says how
      if (!opened.launch) {
        router.push(resultUrl);
        return 'leaving';
      }
      try {
        const outcome = await openCheckout(opened.launch, { name: brandName, description: 'Your order' }, plugins);
        if (outcome.kind === 'dismissed') return 'dismissed';
        if (outcome.kind === 'completed') {
          // Paid in a window on this page: core confirms it, the gateway's webhook settles it either way
          await confirmPaymentAction({
            paymentIntentId: opened.paymentIntentId,
            gatewayResponse: outcome.gatewayResponse,
          });
          router.push(resultUrl);
        }
        // Closed after the gateway took the payment: its webhook settles it, and the result page waits for that
        if (outcome.kind === 'finished') router.push(resultUrl);
        // Redirected: the browser is on its way to the gateway's page
        return 'leaving';
      } catch (error) {
        throw new Error(
          error instanceof CheckoutError ? error.message : 'The payment did not go through. You can try again.',
        );
      }
    },
  });
}

// Cancels the checkout, with its payments still waiting on the shopper, then goes back to the storefront's cart
export function useCancelCheckout(checkoutId: string, paths: CheckoutPaths) {
  return useMutation({
    mutationFn: async () => {
      const result = await cancelCheckoutAction(checkoutId);
      if (!result.ok) throw new Error(result.error ?? 'This checkout could not be cancelled. Try again.');
    },
    // Stays pending ("Cancelling…") until the cart page replaces this one
    onSuccess: () => window.location.assign(paths.cart),
  });
}
