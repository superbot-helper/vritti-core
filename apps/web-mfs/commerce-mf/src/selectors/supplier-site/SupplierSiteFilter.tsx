import { SelectFilter, type SelectFilterProps } from '@vritti/quantum-ui/Select';
import type { DistributiveOmit } from '@vritti/quantum-ui/types/utility';
import { forwardRef, useMemo } from 'react';
import { useSupplierSitesTable } from '@/hooks/legal-entity/suppliers';

// Always a multi-select, so only the multiple branch of SelectFilterProps applies
export type SupplierSiteFilterProps = DistributiveOmit<
  Extract<SelectFilterProps, { multiple: true }>,
  'options' | 'name' | 'multiple'
> & {
  name?: string;
  supplierId: string;
};

// Pre-configured SelectFilter over the sites a supplier is enrolled at
export const SupplierSiteFilter = Object.assign(
  forwardRef<HTMLButtonElement, SupplierSiteFilterProps>(({ supplierId, ...props }, ref) => {
    const { data } = useSupplierSitesTable(supplierId);
    const options = useMemo(
      () =>
        (data?.result ?? [])
          .filter((site) => site.enrollmentStatus === 'ENROLLED')
          .map((site) => ({
            value: site.siteId,
            label: site.siteName ?? site.siteId,
            description: site.siteCode ?? undefined,
          })),
      [data],
    );
    return (
      <SelectFilter
        ref={ref}
        name="sites"
        label="Sites"
        placeholder="Select sites"
        multiple
        options={options}
        {...props}
      />
    );
  }),
  { displayName: 'SupplierSiteFilter', defaultLabel: 'Sites', defaultName: 'sites' },
);
