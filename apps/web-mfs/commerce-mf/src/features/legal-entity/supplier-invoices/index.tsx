import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { SupplierInvoiceDetailSkeleton } from '@/components/supplier-invoices/SupplierInvoiceDetailSkeleton';
import { SupplierInvoiceDetailPage } from './SupplierInvoiceDetailPage';
import { SupplierInvoicesPage } from './SupplierInvoicesPage';

const routes: RouteObject[] = [
  { index: true, element: <SupplierInvoicesPage /> },
  {
    path: ':invoiceSlug',
    element: (
      <Suspense fallback={<SupplierInvoiceDetailSkeleton />}>
        <SupplierInvoiceDetailPage />
      </Suspense>
    ),
  },
];

export default routes;
