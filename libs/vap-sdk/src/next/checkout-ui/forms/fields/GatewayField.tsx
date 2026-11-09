'use client';

import { ShieldCheck } from 'lucide-react';
import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { gatewayName } from '../../lib/gateways.js';
import { methodsOf } from '../../lib/plugins.js';
import type { PaymentFormData } from '../../schemas/checkout.js';
import { GatewayLogo } from './GatewayLogo.js';
import { TileRadio } from './TileRadio.js';

interface GatewayFieldProps {
  gateways: string[];
  // Each gateway's catalog logo, by code
  logos: Record<string, string | null>;
  disabled?: boolean;
}

// The payment form's `gatewayCode`: a tile per gateway, each its logo
export const GatewayField: FC<GatewayFieldProps> = ({ gateways, logos, disabled }) => {
  const { control, setValue } = useFormContext<PaymentFormData>();
  // One gateway is no choice: say who processes the payment instead of offering a single tile to pick
  if (gateways.length === 1) {
    const [code] = gateways;
    return (
      <div className="min-w-0">
        <div className="mb-2 font-medium text-foreground text-sm">Payment gateway</div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3">
          <GatewayLogo code={code} logoUrl={logos[code] ?? null} />
          {/* The logo names the gateway; the line says what it does, with the name for a screen reader */}
          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground text-sm">
            <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
            <span>
              <span className="sr-only">{gatewayName(code)} </span>
              Processes this payment securely.
            </span>
          </span>
        </div>
      </div>
    );
  }
  return (
    <Controller
      control={control}
      name="gatewayCode"
      render={({ field, fieldState }) => (
        <TileRadio
          name={field.name}
          label="Payment gateway"
          value={field.value}
          onChange={(code) => {
            field.onChange(code);
            // Another gateway takes other methods: start it on its first
            setValue('paymentMethod', methodsOf(code)[0] ?? '');
          }}
          disabled={disabled}
          error={fieldState.error?.message}
          className="grid-cols-2"
          tileClassName="h-[72px] items-center justify-center p-3"
          options={gateways.map((code) => ({
            value: code,
            ariaLabel: gatewayName(code),
            content: (
              <span className="flex w-full items-center justify-center">
                <GatewayLogo code={code} logoUrl={logos[code] ?? null} />
              </span>
            ),
          }))}
        />
      )}
    />
  );
};
