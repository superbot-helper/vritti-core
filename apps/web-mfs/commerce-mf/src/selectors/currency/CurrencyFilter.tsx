import { SelectFilter, type SelectFilterProps } from '@vritti/quantum-ui/Select';
import type { DistributiveOmit } from '@vritti/quantum-ui/types/utility';
import { forwardRef } from 'react';
import { CURRENCIES } from './currencies';

export type CurrencyFilterProps = DistributiveOmit<SelectFilterProps, 'options' | 'name'> & {
  name?: string;
  excludeCodes?: string[];
  includeCodes?: string[];
};

// Pre-configured SelectFilter for currency filtering with static local options
export const CurrencyFilter = Object.assign(
  forwardRef<HTMLButtonElement, CurrencyFilterProps>(({ excludeCodes, includeCodes, ...props }, ref) => {
    const options = CURRENCIES.filter(
      (c) => (!includeCodes || includeCodes.includes(String(c.value))) && !excludeCodes?.includes(String(c.value)),
    );
    return (
      <SelectFilter
        ref={ref}
        name="currency"
        label="Currency"
        placeholder="Select currency"
        options={options}
        {...props}
      />
    );
  }),
  { displayName: 'CurrencyFilter', defaultLabel: 'Currency', defaultName: 'currency' },
);
