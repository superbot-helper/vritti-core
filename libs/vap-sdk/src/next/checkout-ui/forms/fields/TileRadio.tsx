'use client';

import { cn } from '@vritti/quantum-ui/cn';
import { Check } from 'lucide-react';
import type { FC, ReactNode } from 'react';

export interface TileOption {
  value: string;
  // What the tile shows
  content: ReactNode;
  // Read out for a tile whose content is a picture
  ariaLabel?: string;
  className?: string;
}

interface TileRadioProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: TileOption[];
  disabled?: boolean;
  error?: string;
  // The grid the tiles sit in
  className?: string;
  // Every tile
  tileClassName?: string;
}

// A radio group drawn as tiles: the chosen one takes the primary border and a check badge. Native radios, visually
// hidden, so arrow keys and screen readers work as on any radio group
export const TileRadio: FC<TileRadioProps> = ({
  name,
  label,
  value,
  onChange,
  options,
  disabled,
  error,
  className,
  tileClassName,
}) => (
  <fieldset className="min-w-0">
    <legend className="mb-2 font-medium text-foreground text-sm">{label}</legend>
    <div className={cn('grid gap-3', className)}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              'relative flex cursor-pointer rounded-xl border bg-card p-4 transition-colors',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
              checked ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted/60',
              disabled && 'cursor-not-allowed opacity-60',
              tileClassName,
              option.className,
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              aria-label={option.ariaLabel}
              className="sr-only"
            />
            {option.content}
            {checked ? (
              <span
                className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                aria-hidden
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
    {error ? <p className="mt-2 text-destructive text-sm">{error}</p> : null}
  </fieldset>
);
