'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@vritti/quantum-ui/Button';
import type { Checkout } from '@vritti/vap-sdk';
import { ShoppingBag } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type FC, useEffect, useState } from 'react';
import { cancelCheckoutAction, getActiveCheckoutAction } from '../../payments-actions.js';
import { formatCountdown } from '../lib/format.js';
import { useFormat } from '../lib/format-context.js';
import type { CheckoutPaths } from '../types.js';

interface ActiveCheckoutCardViewProps {
  paths: CheckoutPaths;
}

const ACTIVE_CHECKOUT_KEY = ['vap', 'active-checkout'] as const;

// The time left on the checkout's hold, ticking each second; zero once it has passed
function useTimeLeft(expiresAt: string | undefined): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return expiresAt ? Math.max(0, new Date(expiresAt).getTime() - now) : 0;
}

// "Checkout in progress" on every storefront page while the signed-in party has a live checkout: Resume opens it,
// Cancel ends it. A floating round card at the bottom right on a wide screen, a strip along the bottom on a phone.
// Read afresh on every page change, since the storefront's layout stays mounted across navigations. Not shown on the
// checkout and result pages themselves
export const ActiveCheckoutCardView: FC<ActiveCheckoutCardViewProps> = ({ paths }) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formatMoney } = useFormat();
  const onCheckoutPage = pathname === paths.checkout || pathname.startsWith(`${paths.checkout}/`);
  const onResultPage = pathname === paths.result || pathname.startsWith(`${paths.result}/`);

  const { data: checkout } = useQuery<Checkout | null>({
    queryKey: [...ACTIVE_CHECKOUT_KEY, pathname],
    queryFn: async () => (await getActiveCheckoutAction()).checkout,
    enabled: !onCheckoutPage && !onResultPage,
    staleTime: 0,
  });
  const cancel = useMutation({
    mutationFn: async (checkoutId: string) => {
      const result = await cancelCheckoutAction(checkoutId);
      if (!result.ok) throw new Error(result.error ?? 'This checkout could not be cancelled. Try again.');
    },
    onSuccess: () => {
      queryClient.setQueriesData({ queryKey: ACTIVE_CHECKOUT_KEY }, null);
      router.refresh();
    },
  });
  const left = useTimeLeft(checkout?.expiresAt);

  if (onCheckoutPage || onResultPage || !checkout || left <= 0) return null;
  const resumeUrl = `${paths.checkout}?checkout=${encodeURIComponent(checkout.id)}`;
  const busy = cancel.isPending || cancel.isSuccess;

  return (
    <div className="vap-checkout-root">
      <section
        aria-label="Checkout in progress"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[340px] lg:rounded-2xl lg:border lg:p-4 lg:shadow-xl"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="size-5 text-primary" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground text-sm">Checkout in progress</div>
            <div className="text-muted-foreground text-xs">
              <span className="font-medium text-foreground tabular-nums">{formatMoney(checkout.total)}</span>
              {' · held '}
              <span className="font-mono tabular-nums">{formatCountdown(left)}</span>
            </div>
          </div>
        </div>
        {cancel.error ? <p className="mt-2 text-destructive text-xs">{cancel.error.message}</p> : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            isLoading={busy}
            loadingText="Cancelling…"
            onClick={() => cancel.mutate(checkout.id)}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={() => window.location.assign(resumeUrl)}>
            Resume →
          </Button>
        </div>
      </section>
    </div>
  );
};
