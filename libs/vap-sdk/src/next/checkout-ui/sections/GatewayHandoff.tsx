'use client';

import { Spinner } from '@vritti/quantum-ui/Spinner';
import type { FC } from 'react';

interface GatewayHandoffProps {
  // The gateway's name
  gateway: string;
}

// In place of the payment form while the payment opens: the browser is about to leave for the gateway's page, or its
// window is opening over this one
export const GatewayHandoff: FC<GatewayHandoffProps> = ({ gateway }) => (
  <output aria-live="polite" className="block rounded-xl border border-border bg-card px-6 py-8 text-center">
    <Spinner className="mx-auto size-7 text-primary" aria-hidden />
    <h2 className="mt-4 font-semibold text-foreground text-lg">Opening {gateway}…</h2>
    <p className="mx-auto mt-2 max-w-[36ch] text-muted-foreground text-sm">
      Please don’t close or refresh this page. You’ll complete the payment on {gateway}’s secure page and come back here
      automatically.
    </p>
  </output>
);
