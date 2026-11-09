'use client';

import type { Checkout } from '@vritti/vap-sdk';
import { type FC, useEffect } from 'react';
import { ClosedCard } from '../cards/ClosedCard.js';
import { PaidCard } from '../cards/PaidCard.js';
import { PendingCard } from '../cards/PendingCard.js';
import { useBackGuard } from '../hooks/use-back-guard.js';
import { useCheckoutStatus } from '../hooks/use-checkout-status.js';
import { CheckoutFrame } from '../layout/CheckoutFrame.js';
import { type CheckoutPaths, STORE_HOME } from '../types.js';

interface ResultScreenProps {
  initial: Checkout | null;
  storeNames: Record<string, string>;
  brandName: string;
  // Arrived straight from the gateway (?intent=), rather than a later visit
  justPaid: boolean;
  paths: CheckoutPaths;
}

// The outcome of a checkout: paid with its orders, being confirmed (read again every few seconds), or closed. A failed
// payment goes back to the checkout page, which shows why, with a retry on the same checkout
export const ResultScreen: FC<ResultScreenProps> = ({ initial, storeNames, brandName, justPaid, paths }) => {
  const { checkout, outcome, slow } = useCheckoutStatus(initial);
  // Paid: Back would lead into the checkout and the gateway's pages again, so it goes to the store instead
  useBackGuard(outcome === 'paid', () => window.location.assign(STORE_HOME));

  useEffect(() => {
    if (outcome === 'failed' && checkout) {
      window.location.replace(`${paths.checkout}?checkout=${encodeURIComponent(checkout.id)}&payment=failed`);
    }
  }, [outcome, checkout, paths.checkout]);

  if (outcome === 'paid' && checkout) {
    return (
      <CheckoutFrame>
        <PaidCard checkout={checkout} storeNames={storeNames} brandName={brandName} justPaid={justPaid} />
      </CheckoutFrame>
    );
  }
  if ((outcome === 'pending' || outcome === 'failed') && checkout) {
    return (
      <CheckoutFrame>
        <PendingCard checkout={checkout} slow={slow} />
      </CheckoutFrame>
    );
  }
  return (
    <CheckoutFrame>
      <ClosedCard
        kind={outcome !== 'closed' ? 'invalid' : checkout?.status === 'CANCELLED' ? 'cancelled' : 'expired'}
        backUrl={paths.cart}
        backLabel={`Back to ${brandName}`}
      />
    </CheckoutFrame>
  );
};
