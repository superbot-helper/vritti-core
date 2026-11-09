'use client';

import { Button } from '@vritti/quantum-ui/Button';
import type { Money } from '@vritti/vap-sdk';
import { Lock } from 'lucide-react';
import type { FC } from 'react';
import { PAYMENT_FORM_ID } from '../forms/PaymentForm.js';
import { useFormat } from '../lib/format-context.js';

interface PaymentActionsProps {
  total: Money | null;
  // The gateway's name, for Pay's accessible name
  gatewayLabel: string;
  paying: boolean;
  cancelling: boolean;
  // Pay cannot be pressed: no address, or no gateway
  payDisabled: boolean;
  onCancel: () => void;
}

// Cancel and Pay side by side, half the width each: Cancel ends the checkout and returns to the cart.
// Pay submits the payment form by its id, so the same pair works inside the form (desktop) and in the mobile pay bar
export const PaymentActions: FC<PaymentActionsProps> = ({
  total,
  gatewayLabel,
  paying,
  cancelling,
  payDisabled,
  onCancel,
}) => {
  const { formatMoney } = useFormat();
  const busy = paying || cancelling;
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Leaving ends this checkout: the cart keeps its items, and Checkout starts a fresh one */}
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={busy}
        isLoading={cancelling}
        loadingText="Cancelling…"
        className="h-14 w-full font-medium text-base"
      >
        Cancel
      </Button>
      {/* Two lines, so a half-width button holds a lakh-sized amount on a small phone */}
      <Button
        type="submit"
        form={PAYMENT_FORM_ID}
        className="h-14 w-full min-w-0 px-3"
        disabled={payDisabled || busy}
        isLoading={paying}
        loadingText="Opening…"
        aria-label={`Pay ${formatMoney(total)} with ${gatewayLabel}`}
      >
        <span className="flex flex-col items-center leading-tight">
          <span className="flex items-center gap-1.5 font-semibold text-base">
            <Lock className="size-4" aria-hidden />
            Pay
          </span>
          <span className="font-medium text-sm tabular-nums">{formatMoney(total)}</span>
        </span>
      </Button>
    </div>
  );
};
