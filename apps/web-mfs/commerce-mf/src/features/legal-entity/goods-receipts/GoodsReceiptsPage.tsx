import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { GoodsReceiptsTable } from '@/components/goods-receipts/GoodsReceiptsTable';
import { binding } from './binding';

export const GoodsReceiptsPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader
      title="Goods Receipts"
      description="Goods received at every site of the company, against their purchase orders"
    />
    <GoodsReceiptsTable binding={binding} />
  </div>
);
