import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import type { AxiosError } from 'axios';
import { SITE_SUPPLIER_KEY } from '@/hooks/site/suppliers/keys';
import { useSiteId } from '@/hooks/site/useSiteId';
import type { SupplierEnrollmentDetail, SupplierEnrollmentKey } from '@/schemas/supplier-enrollments';
import { getSupplierEnrollment } from '@/services/site/suppliers.service';

// The supplier of a site supplier page at the session site, which never appears in the URL
export function useSupplierEnrollmentRef(): SupplierEnrollmentKey {
  const { id: supplierId } = useSlugParams('supplierSlug');
  return { supplierId, siteId: useSiteId() };
}

// Fetches a supplier as the session site sees it, enrolled there or not
export function useSupplierEnrollment(key: SupplierEnrollmentKey) {
  return useSuspenseQuery<SupplierEnrollmentDetail, AxiosError>({
    queryKey: SITE_SUPPLIER_KEY(key.supplierId),
    queryFn: () => getSupplierEnrollment(key),
  });
}

// Fetches a supplier as the session site sees it without suspending; idle until a supplier is picked
export function useSupplierEnrollmentLookup(supplierId: string | undefined) {
  return useQuery<SupplierEnrollmentDetail, AxiosError>({
    queryKey: SITE_SUPPLIER_KEY(supplierId ?? ''),
    queryFn: () => getSupplierEnrollment({ supplierId: supplierId as string }),
    enabled: !!supplierId,
  });
}
