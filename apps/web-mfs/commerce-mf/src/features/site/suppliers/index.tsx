import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { SupplierQuotationPageSkeleton } from '@/components/suppliers/quotations/SupplierQuotationPageSkeleton';
import { SupplierEnrollmentDetailSkeleton } from '@/components/suppliers/SupplierEnrollmentDetailSkeleton';
import { SupplierSiteItemDetailSkeleton } from '@/components/suppliers/SupplierSiteItemDetailSkeleton';
import { SupplierQuotationPage } from './quotations/SupplierQuotationPage';
import { SupplierDetailPage } from './SupplierDetailPage';
import { SupplierSiteItemDetailPage } from './SupplierSiteItemDetailPage';
import { SuppliersPage } from './SuppliersPage';

const routes: RouteObject[] = [
  { index: true, element: <SuppliersPage /> },
  {
    path: ':supplierSlug',
    element: (
      <Suspense fallback={<SupplierEnrollmentDetailSkeleton />}>
        <SupplierDetailPage />
      </Suspense>
    ),
  },
  {
    path: ':supplierSlug/quotations/:quotationSlug',
    element: (
      <Suspense fallback={<SupplierQuotationPageSkeleton />}>
        <SupplierQuotationPage />
      </Suspense>
    ),
  },
  {
    path: ':supplierSlug/site-items/:itemSlug',
    element: (
      <Suspense fallback={<SupplierSiteItemDetailSkeleton />}>
        <SupplierSiteItemDetailPage />
      </Suspense>
    ),
  },
];

export default routes;
