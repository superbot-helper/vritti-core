import { useFormatters } from '@vritti/quantum-ui/hooks';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import type React from 'react';
import { StatStrip } from '@/components/StatStrip';
import type { PurchaseOrderSupplierInvoicesBinding } from './bindings';
import { SupplierInvoicesTable } from './SupplierInvoicesTable';

interface PurchaseOrderInvoicesTabProps {
  binding: PurchaseOrderSupplierInvoicesBinding;
  purchaseOrderId: string;
}

// A purchase order's Invoices tab: how much of the order is billed and how many of its invoices carry match flags,
// above its invoices; an invoice opens on its own page outside the order
export const PurchaseOrderInvoicesTab: React.FC<PurchaseOrderInvoicesTabProps> = ({ binding, purchaseOrderId }) => {
  const fmt = useFormatters();
  const { data: summary } = binding.useSummary(purchaseOrderId);
  const { data: response, isLoading } = binding.useTable(purchaseOrderId);

  return (
    <div className="flex flex-col gap-4">
      {summary && (
        <StatStrip
          stats={[
            { value: fmt.number(summary.invoiceCount).primary, label: pluralize('invoice', summary.invoiceCount) },
            { value: fmt.number(summary.flaggedInvoiceCount).primary, label: 'flagged' },
            {
              value: `${fmt.number(summary.billedPercent).primary}%`,
              label: `of the ordered quantity billed (${fmt.number(summary.billedQty).primary})`,
            },
          ]}
        />
      )}
      <SupplierInvoicesTable
        binding={binding}
        mode="tab"
        response={response}
        isLoading={isLoading}
        slug={binding.tableSlug(purchaseOrderId)}
        queryKey={binding.tableKey(purchaseOrderId)}
        purchaseOrderId={purchaseOrderId}
        emptyDescription="Record the supplier's invoice for this order, then enter its billed lines and post it."
      />
    </div>
  );
};
