import { Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { SupplierQuotationPageSkeleton } from '@/components/suppliers/quotations/SupplierQuotationPageSkeleton';
import { SupplierEnrollmentDetailSkeleton } from '@/components/suppliers/SupplierEnrollmentDetailSkeleton';
import { SupplierQuotationPage } from './quotations/SupplierQuotationPage';
import { SupplierDetailPage } from './SupplierDetailPage';
import { SupplierDetailPageSkeleton } from './SupplierDetailPageSkeleton';
import { SupplierEnrollmentPage } from './SupplierEnrollmentPage';
import { SupplierItemDetailPage } from './SupplierItemDetailPage';
import { SupplierItemDetailPageSkeleton } from './SupplierItemDetailPageSkeleton';
import { SuppliersPage } from './SuppliersPage';

const routes: RouteObject[] = [
  { index: true, element: <SuppliersPage /> },
  { path: ':supplierSlug', element: <Navigate to="overview" replace /> },
  {
    path: ':supplierSlug/:tab',
    element: (
      <Suspense fallback={<SupplierDetailPageSkeleton />}>
        <SupplierDetailPage />
      </Suspense>
    ),
  },
  {
    path: ':supplierSlug/quotations/:quotationId',
    element: (
      <Suspense fallback={<SupplierQuotationPageSkeleton editable />}>
        <SupplierQuotationPage />
      </Suspense>
    ),
  },
  { path: ':supplierSlug/items/:itemSlug', element: <Navigate to="overview" replace /> },
  {
    path: ':supplierSlug/items/:itemSlug/:tab',
    element: (
      <Suspense fallback={<SupplierItemDetailPageSkeleton />}>
        <SupplierItemDetailPage />
      </Suspense>
    ),
  },
  {
    path: ':supplierSlug/enrollments/:siteSlug',
    element: (
      <Suspense fallback={<SupplierEnrollmentDetailSkeleton />}>
        <SupplierEnrollmentPage />
      </Suspense>
    ),
  },
];

export default routes;
