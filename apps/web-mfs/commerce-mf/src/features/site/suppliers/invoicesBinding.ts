import { SITE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { buildSlug } from '@vritti/quantum-ui/slug';
import type { SupplierInvoicesBinding } from '@/components/supplier-invoices/bindings';
import type { SupplierInvoiceMutationOptions } from '@/components/supplier-invoices/types';
import {
  useAddSupplierInvoiceLine,
  useCreateSupplierInvoice,
  usePostSupplierInvoice,
  useRemoveSupplierInvoiceLine,
  useUpdateSupplierInvoice,
  useUpdateSupplierInvoiceLine,
} from '@/hooks/site/supplier-invoices';
import type { CreateSupplierInvoicePayload, SupplierInvoice } from '@/schemas/supplier-invoices';

// New invoices are the supplier's whose page the Invoices tab sits on
function useCreateInvoice(options?: SupplierInvoiceMutationOptions<SupplierInvoice, CreateSupplierInvoicePayload>) {
  return useCreateSupplierInvoice(useSlugParams('supplierSlug').id, options);
}

// The supplier's invoices at the session site; the site enters, edits and posts them but never cancels or deletes
export const invoicesBinding: SupplierInvoicesBinding = {
  permissions: {
    view: SITE_SUPPLIERS.invoices.view,
    add: SITE_SUPPLIERS.invoices.add,
    edit: SITE_SUPPLIERS.invoices.edit,
  },
  spansSites: false,
  // The supplier route is `<supplier>`, so an invoice's page is `invoices/<number~id>` below it
  invoicePath: (invoice) => `invoices/${buildSlug(invoice.invoiceNumber, invoice.id)}`,
  listPath: '../..',
  useCreateInvoice,
  useUpdateInvoice: useUpdateSupplierInvoice,
  usePostInvoice: usePostSupplierInvoice,
  useAddLine: useAddSupplierInvoiceLine,
  useUpdateLine: useUpdateSupplierInvoiceLine,
  useRemoveLine: useRemoveSupplierInvoiceLine,
};
