import { Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { SupplierSiteDetailSkeleton } from '@/components/suppliers/SupplierSiteDetailSkeleton';
import { SupplierSiteItemDetailSkeleton } from '@/components/suppliers/SupplierSiteItemDetailSkeleton';
import { SupplierQuotationPage } from './quotations/SupplierQuotationPage';
import { SupplierQuotationPageSkeleton } from './quotations/SupplierQuotationPageSkeleton';
import { SupplierDetailPage } from './SupplierDetailPage';
import { SupplierDetailPageSkeleton } from './SupplierDetailPageSkeleton';
import { SupplierItemDetailPage } from './SupplierItemDetailPage';
import { SupplierItemDetailPageSkeleton } from './SupplierItemDetailPageSkeleton';
import { SupplierSiteItemPage } from './SupplierSiteItemPage';
import { SupplierSitePage } from './SupplierSitePage';
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
      <Suspense fallback={<SupplierQuotationPageSkeleton />}>
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
    path: ':supplierSlug/sites/:siteSlug',
    element: (
      <Suspense fallback={<SupplierSiteDetailSkeleton />}>
        <SupplierSitePage />
      </Suspense>
    ),
  },
  {
    path: ':supplierSlug/sites/:siteSlug/items/:itemSlug',
    element: (
      <Suspense fallback={<SupplierSiteItemDetailSkeleton />}>
        <SupplierSiteItemPage />
      </Suspense>
    ),
  },
];

export default routes;
