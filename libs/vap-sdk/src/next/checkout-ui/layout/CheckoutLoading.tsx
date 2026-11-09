'use client';

import { Spinner } from '@vritti/quantum-ui/Spinner';
import type { FC } from 'react';
import { CheckoutFrame } from './CheckoutFrame.js';

// What a storefront's loading.tsx shows while the checkout page is read from core
export const CheckoutLoading: FC = () => (
  <CheckoutFrame>
    <div className="flex min-h-[60dvh] items-center justify-center text-muted-foreground">
      <Spinner className="size-6" aria-label="Loading checkout" />
    </div>
  </CheckoutFrame>
);
