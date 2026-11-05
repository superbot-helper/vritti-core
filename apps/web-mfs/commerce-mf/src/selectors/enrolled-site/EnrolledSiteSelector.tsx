import { Select, type SelectOption, type SelectProps } from '@vritti/quantum-ui/Select';
import { forwardRef } from 'react';
import type { SupplierEnrollmentStatus } from '@/schemas/supplier-enrollments';

export type EnrolledSiteSelectorProps = Omit<SelectProps, 'optionsEndpoint'> & {
  supplierId: string | undefined;
  // The legal entity's sites to list against the supplier: enrolled ones (default), not-enrolled ones, or every site
  enrollmentStatus?: SupplierEnrollmentStatus | 'ALL';
};

// The site's code, then a marker when the supplier is not enrolled there
function describeSite(value: string, option: SelectOption): string {
  const notEnrolled = option.additionals?.enrollmentStatus === 'NOT_ENROLLED' ? 'Not Enrolled' : '';
  return [value, notEnrolled].filter(Boolean).join(' · ');
}

// Pre-configured Select over the legal entity's sites as one supplier is enrolled there; inert until the supplier is known
export const EnrolledSiteSelector = forwardRef<HTMLButtonElement, EnrolledSiteSelectorProps>(
  ({ supplierId, enrollmentStatus = 'ENROLLED', params, ...props }, ref) => (
    <Select
      ref={ref}
      label="Site"
      placeholder={supplierId ? 'Select site' : 'Select a supplier first'}
      searchable
      fieldKeys={{
        valueKey: 'id',
        labelKey: 'name',
        descriptionKey: 'code',
        additionalKeys: 'siteCode,enrollmentStatus,isActive',
      }}
      transformDescription={describeSite}
      {...props}
      disabled={!supplierId || props.disabled}
      optionsEndpoint={supplierId ? 'commerce-api/select-api/supplier-enrollments' : undefined}
      params={supplierId ? { ...params, supplierId, enrollmentStatus } : undefined}
    />
  ),
);
EnrolledSiteSelector.displayName = 'EnrolledSiteSelector';
