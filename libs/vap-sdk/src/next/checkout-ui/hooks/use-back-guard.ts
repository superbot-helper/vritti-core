'use client';

import { useEffect, useRef } from 'react';

// The flag on the history entry the guard adds. The rest of the entry's state is copied from the page's own, so the
// framework's router finds what it keeps there
const GUARD_KEY = 'vapCheckoutGuard';

function isGuardState(state: unknown): boolean {
  return typeof state === 'object' && state !== null && (state as Record<string, unknown>)[GUARD_KEY] === true;
}

function pushGuard(): void {
  const state = typeof window.history.state === 'object' && window.history.state !== null ? window.history.state : {};
  window.history.pushState({ ...state, [GUARD_KEY]: true }, '', window.location.href);
}

// Keeps the browser's Back on this page while `active`: one extra history entry for the page itself, so Back only
// steps off it, then the entry goes back and `onBack` runs instead of the browser leaving. Browsers let no page remove
// or edit history, so this is the most a page can do. Chrome ignores an entry added before the shopper has touched the
// page, and a long-press on Back that picks an older page skips it
export function useBackGuard(active: boolean, onBack: () => void): void {
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    if (!active) return;
    // One guard entry, however often the guard turns on and off on the same page
    if (!isGuardState(window.history.state)) pushGuard();

    const onPopState = (event: PopStateEvent) => {
      // Forward onto the guard entry again: nothing to do
      if (isGuardState(event.state)) return;
      pushGuard();
      onBackRef.current();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [active]);
}

// Reloads the page when the browser brings it back from its back-forward cache — the shopper pressed Back on the
// gateway's page. The page would otherwise reappear exactly as it was left ("Opening the gateway…"); a reload reads
// the checkout afresh, so a paid one goes to its result and an ended one says so
export function useReloadOnRestore(): void {
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
}
