'use client';

import { Spinner } from '@vritti/quantum-ui/Spinner';
import type { Checkout } from '@vritti/vap-sdk';
import { ShieldCheck } from 'lucide-react';
import type { FC } from 'react';
import { TrustRow } from '../layout/TrustRow.js';
import { useFormat } from '../lib/format-context.js';
import { gatewayName } from '../lib/gateways.js';
import { CardShell } from './CardShell.js';

interface PendingCardProps {
  checkout: Checkout;
  // Still unconfirmed after the page stopped re-reading
  slow: boolean;
}

// The money may have landed and is being confirmed: nothing to do but wait, and not pay twice
export const PendingCard: FC<PendingCardProps> = ({ checkout, slow }) => {
  const { formatMoney } = useFormat();
  const gateway = checkout.paymentIntent ? gatewayName(checkout.paymentIntent.gatewayCode) : 'the gateway';
  return (
    <CardShell
      tone="pending"
      icon={<Spinner className="size-8" />}
      title="Confirming your payment…"
      footer={<TrustRow gatewayLabel={checkout.paymentIntent ? gateway : null} centered />}
    >
      <div className="mt-2 font-semibold text-[32px] tabular-nums">{formatMoney(checkout.total)}</div>
      <p className="mt-2 text-muted-foreground text-sm">
        {slow
          ? `${gateway} is taking longer than usual. We will confirm your order as soon as it does — you need not pay again.`
          : `We’re checking with ${gateway}. This usually takes a few seconds. Keep this page open.`}
      </p>
      <div className="mt-5 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-left text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        Please don’t pay again. Paying is locked until this check finishes.
      </div>
    </CardShell>
  );
};
