import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

// Placeholder for an invoice's page: its header with actions and the Overview and Lines tabs
export const SupplierInvoiceDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showDescription showActions />
    <TabsSkeleton count={2} tabWidths={['w-20', 'w-16']} />
  </div>
);
