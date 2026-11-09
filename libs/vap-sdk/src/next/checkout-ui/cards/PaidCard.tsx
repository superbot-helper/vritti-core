'use client';

import { Button } from '@vritti/quantum-ui/Button';
import type { Checkout } from '@vritti/vap-sdk';
import { Check } from 'lucide-react';
import type { FC } from 'react';
import { TrustRow } from '../layout/TrustRow.js';
import { useFormat } from '../lib/format-context.js';
import { gatewayName, methodTitle } from '../lib/gateways.js';
import { STORE_HOME } from '../types.js';
import { CardShell } from './CardShell.js';

interface PaidCardProps {
  checkout: Checkout;
  storeNames: Record<string, string>;
  brandName: string;
  // Straight back from the gateway, rather than a later visit
  justPaid: boolean;
}

// Paid: the amount, how it was paid, and one order per store
export const PaidCard: FC<PaidCardProps> = ({ checkout, storeNames, brandName, justPaid }) => {
  const { formatMoney, formatPaidAt } = useFormat();
  const payment = checkout.paymentIntent;
  const via = payment
    ? [gatewayName(payment.gatewayCode), methodTitle(payment.method)].filter(Boolean).join(' · ')
    : null;
  const paidAt = checkout.paidAt ?? payment?.paidAt ?? null;
  return (
    <CardShell
      tone="success"
      icon={<Check className="size-8" strokeWidth={3} aria-hidden />}
      title={justPaid ? 'Payment received' : 'Already paid'}
      footer={<TrustRow gatewayLabel={payment ? gatewayName(payment.gatewayCode) : null} centered />}
    >
      <div className="mt-2 font-semibold text-[32px] tabular-nums">{formatMoney(checkout.total)}</div>
      <div className="mt-1 text-muted-foreground text-sm">
        {[via ? `Paid via ${via}` : null, paidAt ? formatPaidAt(paidAt) : null].filter(Boolean).join(' · ')}
      </div>
      <div className="-mx-6 mt-6 border-t text-left">
        <div className="px-6 pt-4 pb-1 font-medium text-muted-foreground text-xs">
          Your orders{checkout.sites.length > 1 ? ' · one per store' : ''}
        </div>
        <ul>
          {checkout.sites.map((share) => {
            const order = checkout.orders.find((entry) => entry.siteId === share.siteId);
            return (
              <li
                key={share.siteId}
                className="flex items-center justify-between gap-3 border-b px-6 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm">{storeNames[share.siteId] ?? 'Store'}</div>
                  {order ? (
                    <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-foreground text-xs">
                      {order.orderNumber}
                    </span>
                  ) : (
                    <span className="mt-1 inline-block text-muted-foreground text-xs">Order being created…</span>
                  )}
                </div>
                <span className="text-sm tabular-nums">{formatMoney(share.subtotal)}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="-mx-6 border-t px-6 pt-5">
        <Button className="h-[52px] w-full text-base" onClick={() => window.location.assign(STORE_HOME)}>
          Back to {brandName}
        </Button>
      </div>
    </CardShell>
  );
};
