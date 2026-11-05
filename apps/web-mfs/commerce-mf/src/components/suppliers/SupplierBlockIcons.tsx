import { Tooltip } from '@vritti/quantum-ui/Tooltip';
import { BanknoteX, PackageX } from 'lucide-react';
import type React from 'react';

interface SupplierBlockIconsProps {
  purchasingBlocked: boolean;
  paymentBlocked: boolean;
}

// The supplier's LE-level blocks as compact icons; renders nothing when neither is set
export const SupplierBlockIcons: React.FC<SupplierBlockIconsProps> = ({ purchasingBlocked, paymentBlocked }) => {
  if (!purchasingBlocked && !paymentBlocked) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      {purchasingBlocked && (
        <Tooltip content="Purchasing blocked — no new purchase orders or goods receipts">
          <PackageX className="size-3.5 shrink-0 text-destructive" aria-label="Purchasing blocked" />
        </Tooltip>
      )}
      {paymentBlocked && (
        <Tooltip content="Payment blocked — payments to this supplier are held">
          <BanknoteX className="size-3.5 shrink-0 text-warning" aria-label="Payment blocked" />
        </Tooltip>
      )}
    </span>
  );
};
