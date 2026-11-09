'use client';

import { cn } from '@vritti/quantum-ui/cn';
import { Lock } from 'lucide-react';
import type { FC } from 'react';

interface TrustRowProps {
  // The gateway's name, when one is chosen
  gatewayLabel: string | null;
  centered?: boolean;
}

// "Secured by VAP · Paying via Razorpay", under the actions
export const TrustRow: FC<TrustRowProps> = ({ gatewayLabel, centered }) => (
  <div className={cn('flex flex-col gap-1 text-xs', centered ? 'items-center text-center' : '')}>
    <div className="flex items-center gap-1.5">
      <Lock className="size-3.5 text-primary" aria-hidden />
      <span className="font-medium text-foreground">Secured by VAP</span>
      {gatewayLabel ? <span className="text-muted-foreground">· Paying via {gatewayLabel}</span> : null}
    </div>
    <div className="text-muted-foreground">Your card details are never shared with the store.</div>
  </div>
);
