import type React from 'react';
import { SupplierInvoicesTable } from '@/components/supplier-invoices/SupplierInvoicesTable';
import { SITE_SUPPLIER_INVOICES_TABLE_KEY, useSupplierInvoicesTable } from '@/hooks/site/supplier-invoices';
import { invoicesBinding } from '../invoicesBinding';

interface InvoicesTabProps {
  supplierId: string;
}

// The supplier's invoices at the session site, on the supplier's page
export const InvoicesTab: React.FC<InvoicesTabProps> = ({ supplierId }) => {
  const { data: response, isLoading } = useSupplierInvoicesTable(supplierId);

  return (
    <SupplierInvoicesTable
      binding={invoicesBinding}
      mode="tab"
      response={response}
      isLoading={isLoading}
      slug={`commerce-site-supplier-${supplierId}-invoices`}
      queryKey={SITE_SUPPLIER_INVOICES_TABLE_KEY(supplierId)}
      supplierId={supplierId}
      emptyDescription="Record the supplier's invoice against one of this site's confirmed purchase orders."
    />
  );
};
