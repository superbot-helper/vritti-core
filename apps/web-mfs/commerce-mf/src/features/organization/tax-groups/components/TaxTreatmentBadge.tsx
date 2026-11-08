import { Badge } from '@vritti/quantum-ui/Badge';
import { TAX_TREATMENT_LABELS, type TaxTreatment, TaxTreatmentValues } from '@/schemas/tax-groups';

const TREATMENT_VARIANTS = {
  [TaxTreatmentValues.TAXABLE]: 'default',
  [TaxTreatmentValues.ZERO_RATED]: 'secondary',
  [TaxTreatmentValues.EXEMPT]: 'secondary',
  [TaxTreatmentValues.OUT_OF_SCOPE]: 'outline',
} as const satisfies Record<TaxTreatment, 'default' | 'secondary' | 'outline'>;

export const TaxTreatmentBadge = ({ treatment }: { treatment: TaxTreatment }) => (
  <Badge variant={TREATMENT_VARIANTS[treatment]}>{TAX_TREATMENT_LABELS[treatment]}</Badge>
);
