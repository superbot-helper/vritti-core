import { Badge } from '@vritti/quantum-ui/Badge';
import { StringCell } from '@vritti/quantum-ui/DataTable';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import { Tooltip } from '@vritti/quantum-ui/Tooltip';
import { SUPPLIER_INVOICE_FLAG_LABELS, type SupplierInvoiceFlag } from '@/schemas/supplier-invoices';

// A line's failed match checks, each naming what differs on hover; information only, never a block
export const SupplierInvoiceFlagBadges = ({ flags }: { flags: SupplierInvoiceFlag[] }) =>
  flags.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <Tooltip key={flag.code} content={flag.detail}>
          <Badge variant="warning">{SUPPLIER_INVOICE_FLAG_LABELS[flag.code]}</Badge>
        </Tooltip>
      ))}
    </div>
  ) : (
    <Badge variant="success">Matched</Badge>
  );

// How many match checks an invoice fails over its header and lines
export const SupplierInvoiceFlagCount = ({ count }: { count: number }) =>
  count > 0 ? <Badge variant="warning">{pluralize('flag', count, true)}</Badge> : <StringCell value={null} />;
