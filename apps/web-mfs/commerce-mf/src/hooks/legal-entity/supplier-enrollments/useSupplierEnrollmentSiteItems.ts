import { useQuery } from '@tanstack/react-query';
import { LE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { usePermission } from '@vritti/quantum-ui/PermissionGate';
import type { AxiosError } from 'axios';
import type { SupplierEnrollmentRef } from '@/components/suppliers/types';
import type { SupplierSiteItemDataTableResponse } from '@/schemas/suppliers';
import { getSupplierEnrollmentSiteItemsTable } from '@/services/legal-entity/supplier-enrollments.service';
import { SUPPLIER_ENROLLMENT_SITE_ITEMS_TABLE_KEY } from './keys';

// Fetches the supplier's items as set up at the enrollment's site; self-gates on the site items view permission
export function useSupplierEnrollmentSiteItemsTable(ref: SupplierEnrollmentRef) {
  const { available } = usePermission(LE_SUPPLIERS.siteItems.view);
  const siteId = ref.siteId ?? '';
  return useQuery<SupplierSiteItemDataTableResponse, AxiosError>({
    queryKey: SUPPLIER_ENROLLMENT_SITE_ITEMS_TABLE_KEY(ref.supplierId, siteId),
    queryFn: () => getSupplierEnrollmentSiteItemsTable({ supplierId: ref.supplierId, siteId }),
    enabled: !!ref.supplierId && !!ref.siteId && available,
  });
}
