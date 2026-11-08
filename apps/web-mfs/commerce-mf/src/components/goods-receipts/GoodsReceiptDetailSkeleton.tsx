import { DangerZoneSkeleton } from '@vritti/quantum-ui/DangerZone';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

export const GoodsReceiptDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showDescription showActions />
    <TabsSkeleton count={3} tabWidths={['w-20', 'w-28', 'w-24']} />
    <DangerZoneSkeleton />
  </div>
);
