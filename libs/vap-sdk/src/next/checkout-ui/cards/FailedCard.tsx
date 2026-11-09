'use client';

import { Button } from '@vritti/quantum-ui/Button';
import type { Checkout } from '@vritti/vap-sdk';
import { RefreshCw, X } from 'lucide-react';
import type { FC } from 'react';
import { TrustRow } from '../layout/TrustRow.js';
import { useFormat } from '../lib/format-context.js';
import { gatewayName, methodTitle } from '../lib/gateways.js';
import { CardShell } from './CardShell.js';

interface FailedCardProps {
  checkout: Checkout;
  // Why, in plain words
  reason: string;
  busy: boolean;
  // Pays again through the gateway and method last tried
  onRetry: () => void;
  // Back to the page to pick another gateway or method
  onChange: () => void;
}

// The gateway sent the shopper back unpaid: why, and two ways on
export const FailedCard: FC<FailedCardProps> = ({ checkout, reason, busy, onRetry, onChange }) => {
  const { formatMoney } = useFormat();
  const payment = checkout.paymentIntent;
  const attempt = payment
    ? [gatewayName(payment.gatewayCode), methodTitle(payment.method)].filter(Boolean).join(' · ')
    : null;
  return (
    <CardShell
      tone="failed"
      icon={<X className="size-8" strokeWidth={2.5} aria-hidden />}
      title="Payment didn’t go through"
      footer={<TrustRow gatewayLabel={payment ? gatewayName(payment.gatewayCode) : null} centered />}
    >
      <p className="mt-3 font-medium">{reason}</p>
      <p className="mt-2 text-muted-foreground text-sm">
        Your order is still here. If any amount was debited, it will be refunded to the same account.
      </p>
      {attempt ? <p className="mt-2 text-muted-foreground text-xs">{attempt}</p> : null}
      <div className="mt-6 flex flex-col gap-3">
        <Button className="h-[52px] w-full text-base" onClick={onRetry} isLoading={busy} loadingText="Opening…">
          <RefreshCw className="size-4" aria-hidden /> Try again · {formatMoney(checkout.total)}
        </Button>
        <Button variant="outline" className="h-12 w-full" onClick={onChange} disabled={busy}>
          Try another method or gateway
        </Button>
      </div>
    </CardShell>
  );
};
