import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { SupplierInvoiceDetail } from '@/components/supplier-invoices/SupplierInvoiceDetail';
import { useSupplierInvoice } from '@/hooks/legal-entity/supplier-invoices';
import { binding } from './binding';

// `/supplier-invoices/<number~id>` — one of the legal entity's supplier invoices
export const SupplierInvoiceDetailPage = () => {
  const { id } = useSlugParams('invoiceSlug');
  const { data: invoice } = useSupplierInvoice(id);
  return <SupplierInvoiceDetail binding={binding} invoice={invoice} />;
};
