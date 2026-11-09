'use client';

import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { X } from 'lucide-react';
import type { FC } from 'react';

interface CheckoutAlertsProps {
  // The gateway page was closed and sent the shopper back
  cancelledAt: string | null;
  onDismissCancelled: () => void;
  // Pay, Cancel or Change refused, in the action's own words
  error: string | null;
  // The page was closed with the gateway window open
  dismissed: boolean;
  // Several stores with no gateway in common
  notPayableTogether: boolean;
}

// The page's messages, above the delivery section
export const CheckoutAlerts: FC<CheckoutAlertsProps> = ({
  cancelledAt,
  onDismissCancelled,
  error,
  dismissed,
  notPayableTogether,
}) => (
  <>
    {cancelledAt ? (
      <Alert
        variant="info"
        title="Payment cancelled"
        description={`You closed the ${cancelledAt} page, so nothing was charged. Pay again or choose another method.`}
        action={
          <Button variant="ghost" size="icon-sm" aria-label="Dismiss" onClick={onDismissCancelled}>
            <X className="size-4" />
          </Button>
        }
      />
    ) : null}
    {dismissed ? (
      <Alert variant="info" title="Payment cancelled" description="Nothing was charged — you can pay again." />
    ) : null}
    {error ? <Alert variant="destructive" title="Payment not started" description={error} /> : null}
    {notPayableTogether ? (
      <Alert
        variant="destructive"
        title="These stores can’t be paid together"
        description="Go back to your cart and check out one store at a time."
      />
    ) : null}
  </>
);
