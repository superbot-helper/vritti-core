'use client';

import { cn } from '@vritti/quantum-ui/cn';
import { type FC, type ReactNode, useEffect, useRef } from 'react';

export type CardTone = 'success' | 'failed' | 'pending' | 'neutral';

const BADGE: Record<CardTone, string> = {
  success: 'bg-success text-success-foreground',
  failed: 'bg-destructive/10 text-destructive',
  pending: 'bg-primary/10 text-primary',
  neutral: 'bg-primary/10 text-muted-foreground',
};

interface CardShellProps {
  tone: CardTone;
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  // Under the card, e.g. the trust row
  footer?: ReactNode;
}

// One card for every outcome: an icon badge, a title, a body and its actions. Focus moves to the title when it mounts,
// so a screen reader hears the outcome
export const CardShell: FC<CardShellProps> = ({ tone, icon, title, children, footer }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  return (
    <div className="mx-auto w-full max-w-[520px] px-4 py-6 sm:py-14">
      <div
        role={tone === 'failed' ? 'alert' : 'status'}
        className="overflow-hidden rounded-lg border border-border bg-card text-center"
      >
        <div className="px-6 pt-8 pb-6">
          <div className={cn('mx-auto mb-4 flex size-16 items-center justify-center rounded-full', BADGE[tone])}>
            {icon}
          </div>
          <h1 ref={titleRef} tabIndex={-1} className="font-semibold text-xl outline-none">
            {title}
          </h1>
          {children}
        </div>
      </div>
      <div className="mt-5">{footer}</div>
    </div>
  );
};
