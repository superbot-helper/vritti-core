'use client';

import { Button } from '@vritti/quantum-ui/Button';
import { Clock, Link2Off } from 'lucide-react';
import type { FC } from 'react';
import { TrustRow } from '../layout/TrustRow.js';
import { CardShell } from './CardShell.js';

export type ClosedKind = 'expired' | 'cancelled' | 'invalid' | 'empty';

const COPY: Record<ClosedKind, { title: string; lead: string; body: string }> = {
  expired: {
    title: 'This checkout has expired',
    lead: 'Nothing was charged.',
    body: 'Checkouts stay open for 10 minutes. Go back to the store to check out again. Your cart is kept there.',
  },
  cancelled: {
    title: 'This checkout was cancelled',
    lead: 'Nothing was charged.',
    body: 'Go back to the store to check out again. Your cart is kept there.',
  },
  invalid: {
    title: 'We couldn’t find this checkout',
    lead: 'It may have been replaced by a newer one.',
    body: 'Go back to the store and check out again.',
  },
  empty: {
    title: 'Nothing to check out',
    lead: 'Your cart has nothing that can be bought right now.',
    body: 'Add something to your cart, then check out.',
  },
};

interface ClosedCardProps {
  kind: ClosedKind;
  backUrl: string;
  backLabel: string;
}

// Nothing to pay: the checkout ended, cannot be found, or the cart is empty
export const ClosedCard: FC<ClosedCardProps> = ({ kind, backUrl, backLabel }) => {
  const copy = COPY[kind];
  return (
    <CardShell
      tone="neutral"
      icon={kind === 'invalid' ? <Link2Off className="size-7" aria-hidden /> : <Clock className="size-7" aria-hidden />}
      title={copy.title}
      footer={<TrustRow gatewayLabel={null} centered />}
    >
      <p className="mt-3 font-medium">{copy.lead}</p>
      <p className="mt-2 text-muted-foreground text-sm">{copy.body}</p>
      <Button className="mt-6 h-[52px] w-full text-base" onClick={() => window.location.assign(backUrl)}>
        {backLabel}
      </Button>
    </CardShell>
  );
};
