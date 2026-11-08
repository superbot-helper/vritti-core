import { SITE_PURCHASE_ORDERS } from '@vritti/commerce-permissions/purchase-orders';
import { Empty } from '@vritti/quantum-ui/Empty';
import { PermissionGate, PermissionLockIcon } from '@vritti/quantum-ui/PermissionGate';
import type React from 'react';
import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PurchaseOrderDetailSkeleton } from '@/components/purchase-orders/PurchaseOrderDetailSkeleton';
import { PurchaseOrderDetailPage } from './PurchaseOrderDetailPage';
import { PurchaseOrdersPage } from './PurchaseOrdersPage';

// The gate sits outside the boundary so a denied user never mounts the page and never fires its suspense query
function gated(permission: string, element: React.ReactNode, skeleton: React.ReactNode) {
  return (
    <PermissionGate
      permission={permission}
      fallback={({ reason, title, tip }) => (
        <Empty icon={<PermissionLockIcon reason={reason} />} title={title} description={tip} />
      )}
    >
      <Suspense fallback={skeleton}>{element}</Suspense>
    </PermissionGate>
  );
}

const routes: RouteObject[] = [
  { index: true, element: <PurchaseOrdersPage /> },
  {
    path: ':poSlug',
    element: gated(
      SITE_PURCHASE_ORDERS.view,
      <PurchaseOrderDetailPage />,
      <PurchaseOrderDetailSkeleton withInvoices />,
    ),
  },
];

export default routes;
