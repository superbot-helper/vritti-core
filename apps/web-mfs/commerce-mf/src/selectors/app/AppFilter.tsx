import { SelectFilter, type SelectFilterProps } from '@vritti/quantum-ui/Select';
import type { DistributiveOmit } from '@vritti/quantum-ui/types/utility';
import { forwardRef } from 'react';

export type AppFilterProps = DistributiveOmit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for app filtering with async search
export const AppFilter = Object.assign(
  forwardRef<HTMLButtonElement, AppFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="appId"
      label="App"
      placeholder="Select app"
      optionsEndpoint="select-api/apps"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      {...props}
    />
  )),
  { displayName: 'AppFilter', defaultLabel: 'App', defaultName: 'appId' },
);
