import type React from 'react';
import { SiteFilter } from '@/selectors/site';

interface SiteContextFilterProps {
  value: string;
  // The sites that can be picked, e.g. the ones with prices
  siteIds: string[];
  onChange: (siteId: string) => void;
}

// The site a prices table is about, picked in its context bar from the sites it has data at
export const SiteContextFilter: React.FC<SiteContextFilterProps> = ({ value, siteIds, onChange }) => (
  <SiteFilter
    value={value}
    onChange={(result) => onChange(String(result.value))}
    siteIds={siteIds}
    mode="context"
    clearable={false}
  />
);
