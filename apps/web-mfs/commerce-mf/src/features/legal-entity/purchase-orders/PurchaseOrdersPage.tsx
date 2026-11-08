import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { PurchaseOrdersTable } from '@/components/purchase-orders/PurchaseOrdersTable';
import { binding } from './binding';

export const PurchaseOrdersPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Purchase Orders" description="Purchase orders of every site of the company" />
    <PurchaseOrdersTable binding={binding} />
  </div>
);
