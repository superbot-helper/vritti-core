'use client';

import { Button } from '@vritti/quantum-ui/Button';
import { Clock } from 'lucide-react';
import type { FC } from 'react';
import { beginCheckoutAction } from '../../payments-actions.js';
import { TrustRow } from '../layout/TrustRow.js';
import { CardShell } from './CardShell.js';

interface StartCardProps {
  kind: 'start' | 'expired';
  // Why the last start failed
  error?: string;
  // The one store a fresh start is for; left out, the whole cart
  siteId?: string;
  checkoutPath: string;
  backUrl: string;
  backLabel: string;
}

// No live checkout: reached without one, a start that failed, or a window that closed. One press freezes the cart again
// (the same action as the storefront cart's Checkout button) and reopens the page on the new checkout
export const StartCard: FC<StartCardProps> = ({ kind, error, siteId, checkoutPath, backUrl, backLabel }) => (
  <CardShell
    tone={error ? 'failed' : 'neutral'}
    icon={<Clock className="size-7" aria-hidden />}
    title={kind === 'expired' ? 'This checkout has expired' : error ? 'Checkout couldn’t start' : 'Ready to check out'}
    footer={<TrustRow gatewayLabel={null} centered />}
  >
    <p className="mt-3 font-medium">
      {error ?? (kind === 'expired' ? 'Nothing was charged.' : 'Your cart is kept as it is.')}
    </p>
    <p className="mt-2 text-muted-foreground text-sm">
      {kind === 'expired'
        ? 'Checkouts stay open for 10 minutes. Start again to hold your order for another 10.'
        : 'Starting holds your order’s prices for 10 minutes while you pay.'}
    </p>
    <form action={beginCheckoutAction} className="mt-6 flex flex-col gap-3">
      {siteId ? <input type="hidden" name="siteId" value={siteId} /> : null}
      <input type="hidden" name="checkoutPath" value={checkoutPath} />
      <Button type="submit" className="h-[52px] w-full text-base">
        {kind === 'expired' ? 'Start again' : 'Start checkout'}
      </Button>
      <Button type="button" variant="outline" className="h-12 w-full" onClick={() => window.location.assign(backUrl)}>
        {backLabel}
      </Button>
    </form>
  </CardShell>
);
