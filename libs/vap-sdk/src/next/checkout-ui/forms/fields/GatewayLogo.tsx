'use client';

import type { FC } from 'react';
import { gatewayName } from '../../lib/gateways.js';
import { GatewayBadge } from './GatewayBadge.js';

interface GatewayLogoProps {
  code: string;
  // The logo uploaded to the gateway catalog in Vritti Cloud; without one, its badge and name
  logoUrl: string | null;
}

// A gateway as the shopper recognises it: its logo, else its mark and name
export const GatewayLogo: FC<GatewayLogoProps> = ({ code, logoUrl }) =>
  logoUrl ? (
    // biome-ignore lint/performance/noImgElement: a catalog image URL in the SDK; next/image needs the host configured per storefront
    <img src={logoUrl} alt={gatewayName(code)} className="h-7 w-auto max-w-[120px] object-contain" />
  ) : (
    <span className="flex items-center gap-2">
      <GatewayBadge code={code} />
      <span className="font-medium text-foreground">{gatewayName(code)}</span>
    </span>
  );
