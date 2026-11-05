import { SelectFilter, type SelectFilterProps } from '@vritti/quantum-ui/Select';
import type { DistributiveOmit } from '@vritti/quantum-ui/types/utility';
import { forwardRef } from 'react';

// Always a multi-select, so only the multiple branch of SelectFilterProps applies
export type EnrolledSiteFilterProps = DistributiveOmit<
  Extract<SelectFilterProps, { multiple: true }>,
  'optionsEndpoint' | 'name' | 'multiple'
> & {
  name?: string;
  supplierId: string;
};

// Pre-configured SelectFilter over the sites a supplier is enrolled at
export const EnrolledSiteFilter = Object.assign(
  forwardRef<HTMLButtonElement, EnrolledSiteFilterProps>(({ supplierId, params, ...props }, ref) => (
    <SelectFilter
      ref={ref}
      name="sites"
      label="Sites"
      placeholder="Select sites"
      multiple
      optionsEndpoint="commerce-api/select-api/supplier-enrollments"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      {...props}
      params={{ ...params, supplierId, enrollmentStatus: 'ENROLLED' }}
    />
  )),
  { displayName: 'EnrolledSiteFilter', defaultLabel: 'Sites', defaultName: 'sites' },
);
