import type { SelectProps } from '@vritti/quantum-ui/Select';
import { forwardRef } from 'react';
import { SiteSupplierSelector } from '@/selectors/site-supplier';

// The suppliers enrolled at the session site — the only ones it can raise purchase orders with
export const EnrolledSupplierSelector = forwardRef<HTMLButtonElement, Omit<SelectProps, 'optionsEndpoint'>>(
  (props, ref) => <SiteSupplierSelector ref={ref} enrollmentStatus="ENROLLED" {...props} />,
);
EnrolledSupplierSelector.displayName = 'EnrolledSupplierSelector';
