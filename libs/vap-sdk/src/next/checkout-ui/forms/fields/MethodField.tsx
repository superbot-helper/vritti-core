'use client';

import { cn } from '@vritti/quantum-ui/cn';
import type { LucideIcon } from 'lucide-react';
import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { METHODS, type MethodMeta } from '../../lib/gateways.js';
import { methodsOf } from '../../lib/plugins.js';
import type { PaymentFormData } from '../../schemas/checkout.js';
import { TileRadio } from './TileRadio.js';
import { UPI_APPS } from './upi-apps.js';

interface MethodFieldProps {
  disabled?: boolean;
}

const IconBox: FC<{ icon: LucideIcon }> = ({ icon: Icon }) => (
  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
    <Icon className="size-5 text-foreground" aria-hidden />
  </span>
);

// UPI across the whole row: its icon, name and what happens, with the apps a shopper knows as small round chips,
// each its own mark in the same box (Google asks that its mark be no smaller than the marks beside it)
const UpiTile: FC<{ method: MethodMeta }> = ({ method }) => (
  <span className="flex w-full items-center gap-3 pr-5">
    <IconBox icon={method.icon} />
    <span className="min-w-0 flex-1">
      <span className="block font-semibold text-foreground">{method.title}</span>
      <span className="block text-muted-foreground text-sm">{method.subtitle}</span>
    </span>
    <span className="flex shrink-0 items-center gap-1.5">
      {UPI_APPS.map((app) =>
        app.ownShape ? (
          // biome-ignore lint/performance/noImgElement: an inline data URI; next/image would add nothing
          <img key={app.name} src={app.logo} alt={app.name} className="h-7 w-auto" />
        ) : (
          <span
            key={app.name}
            className="flex size-7 items-center justify-center rounded-full border border-border bg-background"
          >
            {/* biome-ignore lint/performance/noImgElement: an inline data URI; next/image would add nothing */}
            <img src={app.logo} alt={app.name} className="size-5 object-contain" />
          </span>
        ),
      )}
    </span>
  </span>
);

// The other methods: icon above the name and a line on what it is
const MethodTile: FC<{ method: MethodMeta }> = ({ method }) => (
  <span className="flex flex-col gap-3">
    <IconBox icon={method.icon} />
    <span>
      <span className="block font-semibold text-foreground">{method.title}</span>
      <span className="block text-muted-foreground text-xs">{method.subtitle}</span>
    </span>
  </span>
);

// The payment form's `paymentMethod`: the methods the chosen gateway's page takes, UPI across the row, the rest as a
// row of tiles
export const MethodField: FC<MethodFieldProps> = ({ disabled }) => {
  const { control } = useFormContext<PaymentFormData>();
  const gatewayCode = useWatch({ control, name: 'gatewayCode' });
  const offered = gatewayCode ? methodsOf(gatewayCode) : [];
  const methods = METHODS.filter((method) => offered.includes(method.code));
  if (!gatewayCode || methods.length === 0) return null;
  const others = methods.filter((method) => method.code !== 'upi').length;
  return (
    <Controller
      control={control}
      name="paymentMethod"
      render={({ field, fieldState }) => (
        <TileRadio
          name={field.name}
          label="Payment method"
          value={field.value}
          onChange={field.onChange}
          disabled={disabled}
          error={fieldState.error?.message}
          className={cn(others >= 3 ? 'grid-cols-3' : others === 2 ? 'grid-cols-2' : 'grid-cols-1')}
          options={methods.map((method) => ({
            value: method.code,
            className: method.code === 'upi' ? 'col-span-full' : undefined,
            content: method.code === 'upi' ? <UpiTile method={method} /> : <MethodTile method={method} />,
          }))}
        />
      )}
    />
  );
};
