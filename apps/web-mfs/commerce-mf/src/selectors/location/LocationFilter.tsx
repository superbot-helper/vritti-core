import { SelectFilter, type SelectFilterProps } from '@vritti/quantum-ui/Select';
import type { DistributiveOmit } from '@vritti/quantum-ui/types/utility';
import { forwardRef } from 'react';

export type LocationFilterProps = DistributiveOmit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

export const LocationFilter = Object.assign(
  forwardRef<HTMLButtonElement, LocationFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="locationId"
      label="Location"
      placeholder="Select location"
      optionsEndpoint="commerce-api/select-api/locations"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'LocationFilter', defaultLabel: 'Location', defaultName: 'locationId' },
);
