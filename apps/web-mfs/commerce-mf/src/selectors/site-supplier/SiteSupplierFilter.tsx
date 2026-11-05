import { SelectFilter, type SelectFilterProps } from '@vritti/quantum-ui/Select';
import type { DistributiveOmit } from '@vritti/quantum-ui/types/utility';
import { forwardRef } from 'react';

export type SiteSupplierFilterProps = DistributiveOmit<SelectFilterProps, 'optionsEndpoint' | 'name'> & {
  name?: string;
};

// Pre-configured SelectFilter over the legal entity's suppliers as the session site sees them
export const SiteSupplierFilter = Object.assign(
  forwardRef<HTMLButtonElement, SiteSupplierFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="supplierId"
      label="Supplier"
      placeholder="Select supplier"
      optionsEndpoint="commerce-api/select-api/site-suppliers"
      fieldKeys={{ valueKey: 'id', labelKey: 'displayName' }}
      {...props}
    />
  )),
  { displayName: 'SiteSupplierFilter', defaultLabel: 'Supplier', defaultName: 'supplierId' },
);
