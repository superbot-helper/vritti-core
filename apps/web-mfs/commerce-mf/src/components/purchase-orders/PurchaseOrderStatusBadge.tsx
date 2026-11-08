import { Badge } from '@vritti/quantum-ui/Badge';
import { type PurchaseOrderStatus, purchaseOrderStatusConfig } from '@/schemas/purchase-orders';

export const PurchaseOrderStatusBadge = ({ status }: { status: PurchaseOrderStatus }) => {
  const { label, variant } = purchaseOrderStatusConfig[status];
  return <Badge variant={variant}>{label}</Badge>;
};
