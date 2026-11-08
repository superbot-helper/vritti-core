import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { PurchaseOrdersTable } from '@/components/purchase-orders/PurchaseOrdersTable';
import { binding } from './binding';

export const PurchaseOrdersPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Purchase Orders" description="Create and manage purchase orders with your suppliers" />
    <PurchaseOrdersTable binding={binding} />
  </div>
);
