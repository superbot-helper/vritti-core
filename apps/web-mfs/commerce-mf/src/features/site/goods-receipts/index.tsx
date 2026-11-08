import { SITE_GOODS_RECEIPTS } from '@vritti/commerce-permissions/goods-receipts';
import { Empty } from '@vritti/quantum-ui/Empty';
import { PermissionGate, PermissionLockIcon } from '@vritti/quantum-ui/PermissionGate';
import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { GoodsReceiptDetailSkeleton } from '@/components/goods-receipts/GoodsReceiptDetailSkeleton';
import { GoodsReceiptDetailPage } from './GoodsReceiptDetailPage';
import { GoodsReceiptsPage } from './GoodsReceiptsPage';

const routes: RouteObject[] = [
  { index: true, element: <GoodsReceiptsPage /> },
  {
    path: ':grSlug',
    element: (
      // The gate sits outside the boundary so a denied user never fires the receipt's suspense query
      <PermissionGate
        permission={SITE_GOODS_RECEIPTS.view}
        fallback={({ reason, title, tip }) => (
          <Empty icon={<PermissionLockIcon reason={reason} />} title={title} description={tip} />
        )}
      >
        <Suspense fallback={<GoodsReceiptDetailSkeleton />}>
          <GoodsReceiptDetailPage />
        </Suspense>
      </PermissionGate>
    ),
  },
];

export default routes;
