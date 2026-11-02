import { SelectFilter, type SelectFilterProps } from '@vritti/quantum-ui/Select';
import type { DistributiveOmit } from '@vritti/quantum-ui/types/utility';
import { forwardRef } from 'react';

export type UserFilterProps = DistributiveOmit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for user filtering
export const UserFilter = Object.assign(
  forwardRef<HTMLButtonElement, UserFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="managerId"
      label="Manager"
      placeholder="Select user"
      optionsEndpoint="users/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'fullName', descriptionKey: 'email' }}
      {...props}
    />
  )),
  { displayName: 'UserFilter', defaultLabel: 'Manager', defaultName: 'managerId' },
);
