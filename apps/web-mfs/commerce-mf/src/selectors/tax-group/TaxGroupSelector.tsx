import { Select, type SelectProps } from '@vritti/quantum-ui/Select';
import { forwardRef } from 'react';

export type TaxGroupSelectorProps = Omit<SelectProps, 'optionsEndpoint'> &
  (
    | { country: string | undefined; anyCountry?: never }
    // Lists every country's groups with the country as description — for navigation, never for picking a group
    | { anyCountry: true; country?: never }
  );

// Pre-configured Select over one country's tax groups (id → name, code as description); inert until the country is known
export const TaxGroupSelector = forwardRef<HTMLButtonElement, TaxGroupSelectorProps>(
  ({ country, anyCountry, params, ...props }, ref) => {
    const listed = anyCountry || !!country;
    return (
      <Select
        ref={ref}
        label="Tax Group"
        placeholder={listed ? 'Select tax group' : 'Select a country first'}
        searchable
        fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: anyCountry ? 'countryCode' : 'code' }}
        {...props}
        disabled={!listed || props.disabled}
        optionsEndpoint={listed ? 'commerce-api/select-api/tax-groups' : undefined}
        params={country ? { ...params, country } : params}
      />
    );
  },
);
TaxGroupSelector.displayName = 'TaxGroupSelector';
