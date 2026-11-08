import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import type React from 'react';
import { useState } from 'react';
import type { SupplierInvoiceDetail as SupplierInvoiceDetailData } from '@/schemas/supplier-invoices';
import type { SupplierInvoicesBinding } from './bindings';
import { SupplierInvoiceDeleteZone } from './SupplierInvoiceDeleteZone';
import { SupplierInvoiceFlagsAlert } from './SupplierInvoiceFlagsAlert';
import { SupplierInvoiceHeaderActions } from './SupplierInvoiceHeaderActions';
import { SupplierInvoiceLinesTable } from './SupplierInvoiceLinesTable';
import { SupplierInvoiceOverview } from './SupplierInvoiceOverview';
import { SupplierInvoiceStatusBadge } from './SupplierInvoiceStatusBadge';

interface SupplierInvoiceDetailProps {
  binding: SupplierInvoicesBinding;
  invoice: SupplierInvoiceDetailData;
}

// A supplier invoice: its match flags, header and billed lines; drafts are posted here, and where the workspace may,
// invoices are cancelled and drafts deleted
export const SupplierInvoiceDetail: React.FC<SupplierInvoiceDetailProps> = ({ binding, invoice }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={invoice.invoiceNumber}
        titleSlot={<SupplierInvoiceStatusBadge status={invoice.status} />}
        description={`${invoice.supplierName} · ${invoice.poNumber}`}
        actions={<SupplierInvoiceHeaderActions binding={binding} invoice={invoice} />}
      />

      <SupplierInvoiceFlagsAlert invoice={invoice} />

      <Tabs
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            permission: binding.permissions.view,
            content: <SupplierInvoiceOverview invoice={invoice} showSite={binding.spansSites} />,
          },
          {
            value: 'lines',
            label: `Lines (${invoice.lines.length})`,
            permission: binding.permissions.view,
            content: <SupplierInvoiceLinesTable binding={binding} invoice={invoice} />,
          },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      {binding.removal && invoice.canDelete && (
        <SupplierInvoiceDeleteZone removal={binding.removal} invoice={invoice} listPath={binding.listPath} />
      )}
    </div>
  );
};
