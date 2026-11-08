import { SelectFilter, type SelectFilterProps } from '@vritti/quantum-ui/Select';
import type { DistributiveOmit } from '@vritti/quantum-ui/types/utility';
import { forwardRef } from 'react';

export type JurisdictionFilterProps = DistributiveOmit<SelectFilterProps, 'optionsEndpoint' | 'name'> & {
  name?: string;
  country: string;
};

// Pre-configured SelectFilter over one country's tax jurisdictions with async search
export const JurisdictionFilter = Object.assign(
  forwardRef<HTMLButtonElement, JurisdictionFilterProps>(({ country, params, ...props }, ref) => (
    <SelectFilter
      ref={ref}
      name="jurisdiction"
      label="State"
      placeholder="Select state"
      optionsEndpoint="commerce-api/select-api/tax-jurisdictions"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      params={{ ...params, country }}
      {...props}
    />
  )),
  { displayName: 'JurisdictionFilter', defaultLabel: 'State', defaultName: 'jurisdiction' },
);
