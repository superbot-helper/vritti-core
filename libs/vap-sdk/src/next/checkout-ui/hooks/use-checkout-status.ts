'use client';

import { useQuery } from '@tanstack/react-query';
import type { Checkout } from '@vritti/vap-sdk';
import { useRef } from 'react';
import { getCheckoutAction } from '../../payments-actions.js';
import { checkoutOutcome } from '../lib/outcome.js';

const POLL_MS = 3000;
const POLL_TRIES = 20;

// A checkout's state on the result page, read again every few seconds while its payment is being confirmed, for at
// most POLL_TRIES reads. `slow` once those run out with the payment still unconfirmed
export function useCheckoutStatus(initial: Checkout | null) {
  const reads = useRef(0);
  const query = useQuery({
    queryKey: ['vap-checkout', initial?.id],
    queryFn: async () => {
      reads.current += 1;
      if (!initial) return null;
      const result = await getCheckoutAction(initial.id);
      return result.checkout ?? null;
    },
    initialData: initial,
    enabled: Boolean(initial),
    refetchInterval: (state) =>
      checkoutOutcome(state.state.data ?? null) === 'pending' && reads.current < POLL_TRIES ? POLL_MS : false,
  });
  const checkout = query.data ?? null;
  const outcome = checkoutOutcome(checkout);
  return { checkout, outcome, slow: outcome === 'pending' && reads.current >= POLL_TRIES };
}
