import { Badge } from '@vritti/quantum-ui/Badge';

export const PaymentTermStatusBadge = ({ isPublished }: { isPublished: boolean }) =>
  isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="secondary">Draft</Badge>;
