import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

interface PurchaseOrderDetailSkeletonProps {
  withInvoices?: boolean;
}

export const PurchaseOrderDetailSkeleton = ({ withInvoices = false }: PurchaseOrderDetailSkeletonProps) => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showDescription showActions />
    <TabsSkeleton
      count={withInvoices ? 4 : 3}
      tabWidths={withInvoices ? ['w-20', 'w-28', 'w-28', 'w-20'] : ['w-20', 'w-28', 'w-28']}
    />
  </div>
);
