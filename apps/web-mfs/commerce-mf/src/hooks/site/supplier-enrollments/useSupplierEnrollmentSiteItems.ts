import type { SupplierEnrollmentRef } from '@/components/suppliers/types';
import { useSupplierSiteItemsTable } from '@/hooks/site/suppliers';

// The site endpoints address a supplier's site items at the session site, so the ref's site goes unused here
export function useSupplierEnrollmentSiteItemsTable(ref: SupplierEnrollmentRef) {
  return useSupplierSiteItemsTable(ref.supplierId);
}
