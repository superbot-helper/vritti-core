'use client';

import { useRouter } from 'next/navigation';
import {
  Component,
  createContext,
  type ErrorInfo,
  type ReactNode,
  startTransition,
  useCallback,
  useContext,
  useState,
} from 'react';

export interface CoreBoundaryProps {
  // Names the part in the log line, e.g. "currency switcher"
  name: string;
  // What shows in place of the part when it fails: nothing by default. A plain element, so a server component can pass
  // it; one that offers a retry reads it with `useCoreRetry()`
  fallback?: ReactNode;
  children: ReactNode;
}

// Asks the server for the page again and gives the failed part a fresh start
const RetryContext = createContext<(() => void) | null>(null);

// For a fallback inside a CoreBoundary: the retry of the part it stands in for
export function useCoreRetry(): () => void {
  const retry = useContext(RetryContext);
  return retry ?? (() => window.location.reload());
}

interface InnerProps {
  name: string;
  fallback: ReactNode;
  children: ReactNode;
}

class Inner extends Component<InnerProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // The page goes on rendering; the failure is still recorded
    console.error(`[vap] ${this.props.name} could not render — showing its fallback`, error, info.componentStack);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// Keeps a failure inside the part of the page that needed core. Wrap a server component that reads from core (a
// currency switcher, a cart, an account section): if it throws while rendering — core down, timed out, failing — only
// it is replaced by `fallback`, and the rest of the page renders as usual:
//
//   <CoreBoundary name="currency switcher">
//     <CurrencySwitcher />
//   </CoreBoundary>
//
//   <CoreBoundary name="cart" fallback={<CartFailed />}>      // CartFailed calls useCoreRetry() for its button
//     <CartContents />
//   </CoreBoundary>
export function CoreBoundary({ name, fallback = null, children }: CoreBoundaryProps) {
  const router = useRouter();
  // A new key remounts the boundary, clearing its failed state. Both in one transition, so the remount renders with the
  // refreshed page from the server rather than the payload that failed
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    startTransition(() => {
      router.refresh();
      setAttempt((count) => count + 1);
    });
  }, [router]);
  return (
    <RetryContext.Provider value={retry}>
      <Inner key={attempt} name={name} fallback={fallback}>
        {children}
      </Inner>
    </RetryContext.Provider>
  );
}
