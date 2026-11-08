import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { GoodsReceiptsTable } from '@/components/goods-receipts/GoodsReceiptsTable';
import { binding } from './binding';

export const GoodsReceiptsPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Goods Receipts" description="Count the goods received against your purchase orders" />
    <GoodsReceiptsTable binding={binding} />
  </div>
);
