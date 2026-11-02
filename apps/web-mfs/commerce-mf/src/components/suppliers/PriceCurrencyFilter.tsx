import type React from 'react';
import { CurrencyFilter } from '@/selectors/currency';

interface PriceCurrencyFilterProps {
  currencies: string[];
  value: string;
  onChange: (currency: string) => void;
}

// Narrows a price chart to one currency; a supplier can requote an item in another of its currencies. Hidden when the
// prices are all in one currency, since there is nothing to choose.
export const PriceCurrencyFilter: React.FC<PriceCurrencyFilterProps> = ({ currencies, value, onChange }) =>
  currencies.length < 2 ? null : (
    <CurrencyFilter
      mode="context"
      clearable={false}
      includeCodes={currencies}
      value={value}
      onChange={(result) => onChange(String(result.value))}
    />
  );
