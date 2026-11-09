'use client';

import { cn } from '@vritti/quantum-ui/cn';
import type { FC, ReactNode } from 'react';
import { Header } from './Header.js';

interface CheckoutFrameProps {
  // The time left, in the header
  timer?: ReactNode;
  // The order summary: the tinted right column on a wide screen, a strip above the page on a narrow one
  summary?: ReactNode;
  children: ReactNode;
}

// The whole page. With a summary: two columns, the form on the left under the VAP header, the summary on the right in
// the muted tint, each the width of a form; narrow screens stack the header, the summary strip, then the form. Without
// one (the outcome cards): one centred column. Every class resolves against checkout-ui.css only, scoped to
// `.vap-checkout-root`
export const CheckoutFrame: FC<CheckoutFrameProps> = ({ timer, summary, children }) => (
  <div className="vap-checkout-root">
    {/* Solid first: the storefront's own page colour must not show through */}
    <div className="min-h-dvh overflow-x-clip bg-background text-foreground">
      <div className={cn('flex min-h-dvh flex-col', summary && 'lg:grid lg:grid-cols-2')}>
        <div className={cn('w-full', summary && 'lg:flex lg:justify-end')}>
          <div className={cn('w-full max-w-[640px] px-4 pb-12 sm:px-8', summary ? 'lg:px-12' : 'mx-auto')}>
            <div className={cn(summary && 'hidden lg:block')}>
              <Header timer={timer} />
            </div>
            <main className="pt-6">{children}</main>
          </div>
        </div>
        {summary ? (
          <aside className="order-first bg-muted/70 lg:order-none lg:border-l lg:border-border">
            <div className="border-b border-border bg-background px-4 sm:px-8 lg:hidden">
              <Header timer={timer} />
            </div>
            <div className="w-full max-w-[600px] px-4 py-5 sm:px-8 lg:sticky lg:top-0 lg:px-12 lg:py-8">{summary}</div>
          </aside>
        ) : null}
      </div>
    </div>
  </div>
);
