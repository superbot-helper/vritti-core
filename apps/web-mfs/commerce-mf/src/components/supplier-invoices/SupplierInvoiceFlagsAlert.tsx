import { Alert } from '@vritti/quantum-ui/Alert';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import type { SupplierInvoiceDetail } from '@/schemas/supplier-invoices';

// The invoice's match against its order and receipts at a glance — flags inform, they never hold the invoice up
export const SupplierInvoiceFlagsAlert = ({ invoice }: { invoice: SupplierInvoiceDetail }) => {
  if (invoice.lines.length === 0) return null;
  if (invoice.flagCount === 0) {
    return (
      <Alert
        variant="success"
        title="Matches the order and its receipts"
        description="Every line agrees with the purchase order and the stock received against it."
      />
    );
  }

  const flaggedLineCount = invoice.lines.filter((line) => line.flags.length > 0).length;
  return (
    <Alert
      variant="warning"
      title={`${pluralize('match flag', invoice.flagCount, true)} to review`}
      description={
        <div className="flex flex-col gap-1">
          {invoice.flags.map((flag) => (
            <span key={flag.code}>{flag.detail}</span>
          ))}
          {flaggedLineCount > 0 && (
            <span>{`${pluralize('line', flaggedLineCount, true)} flagged — see the Lines tab.`}</span>
          )}
          <span>Flags are for review only; the invoice can still be posted.</span>
        </div>
      }
    />
  );
};
