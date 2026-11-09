'use client';

import type { FC } from 'react';
import { ClosedCard } from '../cards/ClosedCard.js';
import { StartCard } from '../cards/StartCard.js';
import { CheckoutFrame } from '../layout/CheckoutFrame.js';
import { type CheckoutPaths, STORE_HOME } from '../types.js';

interface StartScreenProps {
  // 'expired' when the checkout named in the URL ran out; 'start' when there is none, or it was cancelled
  kind: 'start' | 'expired';
  // The cart has nothing buyable
  empty: boolean;
  error?: string;
  siteId?: string;
  brandName: string;
  paths: CheckoutPaths;
}

// The checkout page with no live checkout: start one from the cart, or say there is nothing to buy
export const StartScreen: FC<StartScreenProps> = ({ kind, empty, error, siteId, brandName, paths }) => (
  <CheckoutFrame>
    {empty && !error ? (
      <ClosedCard kind="empty" backUrl={STORE_HOME} backLabel={`Back to ${brandName}`} />
    ) : (
      <StartCard
        kind={kind}
        error={error}
        siteId={siteId}
        checkoutPath={paths.checkout}
        backUrl={paths.cart}
        backLabel={`Back to ${brandName}`}
      />
    )}
  </CheckoutFrame>
);
