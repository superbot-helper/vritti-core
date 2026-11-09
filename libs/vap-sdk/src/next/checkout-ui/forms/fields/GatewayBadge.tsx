'use client';

import type { FC } from 'react';
import { gatewayShort } from '../../lib/gateways.js';

interface GatewayBadgeProps {
  code: string;
}

// "Rz", "Cf", "HD" — a gateway's mark where it has no logo
export const GatewayBadge: FC<GatewayBadgeProps> = ({ code }) => (
  <span className="inline-flex size-7 items-center justify-center rounded-md border border-border font-semibold text-foreground text-xs">
    {gatewayShort(code)}
  </span>
);
