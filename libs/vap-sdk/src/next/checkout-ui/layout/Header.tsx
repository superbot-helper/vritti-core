'use client';

import { ShieldCheck } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { VAP_LOGO_LIGHT } from './vap-logo.js';

interface HeaderProps {
  // The time left, on the right
  timer?: ReactNode;
}

// "Secure Checkout · Powered by VAP" at the top of the form column, the timer beside it
export const Header: FC<HeaderProps> = ({ timer }) => (
  <header className="flex h-20 items-center justify-between gap-4 border-b border-border">
    <div className="flex items-center gap-3">
      <ShieldCheck className="size-8 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
      <div className="leading-tight">
        <div className="font-semibold text-foreground text-lg">Secure Checkout</div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          Powered by
          {/* biome-ignore lint/performance/noImgElement: an inline data URI; next/image would add nothing */}
          <img src={VAP_LOGO_LIGHT} alt="VAP" className="h-4 w-auto" />
        </div>
      </div>
    </div>
    {timer}
  </header>
);
