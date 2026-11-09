'use client';

import { cn } from '@vritti/quantum-ui/cn';
import { type FC, useEffect, useRef, useState } from 'react';
import { formatCountdown } from '../lib/format.js';

const FIVE_MINUTES = 5 * 60 * 1000;
// The ring's radius in its 24-unit box, and its length
const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ExpiryTimerProps {
  expiresAt: string;
  // Stopped while a payment is opening
  paused?: boolean;
  onExpire: () => void;
}

// "Order reserved for mm:ss" in a pill, with a ring that drains as the deadline nears. The last five minutes turn it
// to the destructive tone
export const ExpiryTimer: FC<ExpiryTimerProps> = ({ expiresAt, paused, onExpire }) => {
  const deadline = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());
  // The ring is full when the page opened, whatever was left of the window then
  const initial = useRef(Math.max(1, deadline - now));

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [paused]);

  const remaining = deadline - now;
  useEffect(() => {
    if (!paused && remaining <= 0) onExpire();
  }, [paused, remaining, onExpire]);

  const left = Math.max(0, remaining);
  const fraction = Math.min(1, left / initial.current);
  const urgent = remaining <= FIVE_MINUTES;
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Order reserved for ${minutes} minutes ${seconds} seconds`}
      className={cn(
        'flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-1.5',
        urgent ? 'border-destructive/30 bg-destructive/5' : 'border-primary/20 bg-primary/5',
      )}
    >
      <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden="true">
        <circle cx="12" cy="12" r={RADIUS} fill="none" strokeWidth="2.5" className="stroke-border" />
        <circle
          cx="12"
          cy="12"
          r={RADIUS}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          className={cn(
            'transition-[stroke-dashoffset] duration-1000 ease-linear',
            urgent ? 'stroke-destructive' : 'stroke-primary',
          )}
        />
      </svg>
      <div className="leading-tight">
        <div className="text-[11px] text-muted-foreground">Order reserved for</div>
        <div
          className={cn(
            'font-mono font-semibold text-sm tabular-nums',
            urgent ? 'text-destructive' : 'text-foreground',
          )}
        >
          {formatCountdown(remaining)}
        </div>
      </div>
    </div>
  );
};
