import { Badge } from '@vritti/quantum-ui/Badge';
import { type GoodsReceiptStatus, goodsReceiptStatusConfig } from '@/schemas/goods-receipts';

export const GoodsReceiptStatusBadge = ({ status }: { status: GoodsReceiptStatus }) => {
  const { label, variant } = goodsReceiptStatusConfig[status];
  return <Badge variant={variant}>{label}</Badge>;
};
