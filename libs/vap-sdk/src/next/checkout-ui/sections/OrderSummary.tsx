'use client';

import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import type { Money } from '@vritti/vap-sdk';
import { Package } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { pluralize } from '../lib/format.js';
import { useFormat } from '../lib/format-context.js';
import { itemCount } from '../lib/stores.js';
import type { CheckoutPageStore } from '../types.js';

interface OrderSummaryProps {
  stores: CheckoutPageStore[];
  total: Money | null;
  // The store's name, and its logo when it has one
  brandName: string;
  brandLogoUrl: string | null;
  // Anything to show under the total; the SDK's pay screen keeps Pay and Cancel in the left column instead
  actions?: ReactNode;
}

// The store's mark at the top of the summary: its logo, else its name in type
const Brand: FC<{ name: string; logoUrl: string | null; className?: string }> = ({ name, logoUrl, className }) =>
  logoUrl ? (
    // biome-ignore lint/performance/noImgElement: the storefront's own image URL; next/image needs the host configured per storefront
    <img src={logoUrl} alt={name} className={className ?? 'h-14 w-auto max-w-[200px] object-contain'} />
  ) : (
    <span className="font-semibold text-foreground text-xl">{name}</span>
  );

// Every line of every store, each with the store it is sold by
const Lines: FC<{ stores: CheckoutPageStore[] }> = ({ stores }) => {
  const { formatMoney } = useFormat();
  return (
    <ul className="divide-y divide-border">
      {stores.flatMap((store) =>
        store.lines.map((line) => (
          <li key={line.id} className="flex items-center gap-4 py-4">
            <span className="relative flex size-14 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
              <Package className="size-6 text-muted-foreground" aria-hidden />
              <span
                className="absolute -top-2 -left-2 flex size-5 items-center justify-center rounded-full bg-foreground font-semibold text-[11px] text-background"
                aria-hidden="true"
              >
                {line.quantity}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-foreground text-sm">
                <span className="sr-only">Quantity {line.quantity}. </span>
                {line.name}
              </span>
              <span className="block text-muted-foreground text-xs">Sold by {store.name}</span>
            </span>
            <span className="shrink-0 font-medium text-foreground text-sm tabular-nums">
              {formatMoney(line.lineTotal)}
            </span>
          </li>
        )),
      )}
    </ul>
  );
};

// The subtotal line and the grand total
const Totals: FC<{ stores: CheckoutPageStore[]; total: Money | null }> = ({ stores, total }) => {
  const { formatMoney } = useFormat();
  return (
    <>
      <dl className="border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-foreground">Subtotal · {pluralize(itemCount(stores), 'item')}</dt>
          <dd className="tabular-nums">{formatMoney(total)}</dd>
        </div>
      </dl>
      <p className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="font-semibold text-foreground text-lg">
          Total<span className="sr-only"> to pay</span>
        </span>
        <span className="flex items-baseline gap-1.5">
          {total ? <span className="text-muted-foreground text-xs">{total.currency}</span> : null}
          <span className="font-semibold text-2xl text-foreground tabular-nums">{formatMoney(total)}</span>
        </span>
      </p>
    </>
  );
};

// The store's mark, then its lines and the total: a column beside the form on a wide screen, a strip that opens
// above it on a narrow one
export const OrderSummary: FC<OrderSummaryProps> = ({ stores, total, brandName, brandLogoUrl, actions }) => {
  const { formatMoney } = useFormat();
  return (
    <>
      <section className="hidden lg:block" aria-label="Order summary">
        <div className="flex justify-center border-b border-border pb-6">
          <Brand name={brandName} logoUrl={brandLogoUrl} />
        </div>
        <Lines stores={stores} />
        <Totals stores={stores} total={total} />
        {actions ? <div className="mt-6">{actions}</div> : null}
      </section>
      <section className="lg:hidden" aria-label="Order summary">
        <Collapsible
          className="w-full"
          headerClassName="py-1"
          leading={
            <Brand name={brandName} logoUrl={brandLogoUrl} className="h-9 w-auto max-w-[120px] object-contain" />
          }
          trigger={
            <span className="flex flex-col text-left">
              <span className="font-medium text-foreground text-sm">Order summary</span>
              <span className="text-muted-foreground text-xs">{pluralize(itemCount(stores), 'item')}</span>
            </span>
          }
          trailing={<span className="font-semibold text-foreground tabular-nums">{formatMoney(total)}</span>}
        >
          <Lines stores={stores} />
          <Totals stores={stores} total={total} />
        </Collapsible>
      </section>
    </>
  );
};
