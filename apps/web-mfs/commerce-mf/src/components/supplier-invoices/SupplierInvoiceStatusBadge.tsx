import { Badge, type BadgeProps } from '@vritti/quantum-ui/Badge';
import { SUPPLIER_INVOICE_STATUS_LABELS, type SupplierInvoiceStatus } from '@/schemas/supplier-invoices';

const STATUS_VARIANTS: Record<SupplierInvoiceStatus, BadgeProps['variant']> = {
  DRAFT: 'secondary',
  POSTED: 'success',
  CANCELLED: 'outline',
};

// Draft, posted or cancelled, coloured by how final the invoice is
export const SupplierInvoiceStatusBadge = ({ status }: { status: SupplierInvoiceStatus }) => (
  <Badge variant={STATUS_VARIANTS[status]}>{SUPPLIER_INVOICE_STATUS_LABELS[status]}</Badge>
);
