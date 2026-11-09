'use client';

import type { Money } from '@vritti/vap-sdk';
import type { FC, ReactNode } from 'react';

interface MobilePayBarProps {
  // Kept for callers; the bar no longer prints them, since Pay carries the amount
  total?: Money | null;
  storeCount?: number;
  // Cancel and Pay
  actions: ReactNode;
  hint: string | null;
}

// Phones: Cancel and Pay fixed at the bottom of the screen
export const MobilePayBar: FC<MobilePayBarProps> = ({ actions, hint }) => (
  // The amount is on Pay itself, so the bar carries only the actions
  <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
    {actions}
    {hint ? <p className="mt-2 text-center text-muted-foreground text-xs">{hint}</p> : null}
  </div>
);
