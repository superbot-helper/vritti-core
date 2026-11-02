import { Card, CardContent, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { PAYMENT_TERM_BASELINE_LABELS, type PaymentTermDetailData } from '@/schemas/payment-terms';
import { PaymentTermStatusBadge } from '../components/PaymentTermStatusBadge';

interface OverviewTabProps {
  paymentTerm: PaymentTermDetailData;
}

export const OverviewTab = ({ paymentTerm }: OverviewTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Details</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-6">
        <DetailField label="Name" type="string" value={paymentTerm.name} />
        <DetailField label="Baseline" type="string" value={PAYMENT_TERM_BASELINE_LABELS[paymentTerm.baseline]} />
        <DetailField
          label="Status"
          type="string"
          value={<PaymentTermStatusBadge isPublished={paymentTerm.isPublished} />}
        />
        <DetailField label="Rules" type="number" value={paymentTerm.ruleCount} />
        <DetailField label="Created" type="dateTime" value={paymentTerm.createdAt} />
        <DetailField label="Updated" type="dateTime" value={paymentTerm.updatedAt} />
        <div className="col-span-2">
          <DetailField label="Description" type="string" value={paymentTerm.description} />
        </div>
      </div>
    </CardContent>
  </Card>
);
