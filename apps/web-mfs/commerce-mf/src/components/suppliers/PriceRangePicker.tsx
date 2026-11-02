import { DateRangeFilter } from '@vritti/quantum-ui/DateRangePicker';
import type React from 'react';
import type { PriceRange } from '@/utils/supplierPrice';

interface PriceRangePickerProps {
  value: PriceRange;
  onChange: (range: PriceRange) => void;
}

// The window a price chart shows; DateRangeFilter applies a range only once both ends are picked
export const PriceRangePicker: React.FC<PriceRangePickerProps> = ({ value, onChange }) => (
  <DateRangeFilter
    name="period"
    label="Period"
    mode="context"
    clearable={false}
    value={{ field: 'period', operator: 'between', value: [value.from, value.to] }}
    onChange={(condition) => {
      const range = condition?.value;
      if (Array.isArray(range) && range.length === 2) onChange({ from: range[0], to: range[1] });
    }}
  />
);
