import { Badge } from '@vritti/quantum-ui/Badge';
import type { EnrollmentFlags } from '@/schemas/supplier-enrollments';

interface EnrollmentStatusBadgesProps {
  flags: EnrollmentFlags;
}

export const EnrollmentStatusBadges = ({ flags }: EnrollmentStatusBadgesProps) => {
  const isActive = flags.isActive === true;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={isActive ? 'success' : 'outline'}>{isActive ? 'Active' : 'Inactive'}</Badge>
      {flags.purchasingBlocked && <Badge variant="destructive">Purchasing Blocked</Badge>}
      {flags.paymentBlocked && <Badge variant="destructive">Payment Blocked</Badge>}
    </div>
  );
};
