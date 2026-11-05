import { DetailField } from '@vritti/quantum-ui/DetailField';
import type React from 'react';
import { IDENTIFIER_TYPE_LABELS, type IdentifierType } from '@/schemas/party-identifiers';

interface TaxIdFieldProps {
  taxId: string | null | undefined;
  taxIdType: IdentifierType | null | undefined;
}

// The supplier's tax identification number with the kind of number it is (PAN, TIN, EIN, …)
export const TaxIdField: React.FC<TaxIdFieldProps> = ({ taxId, taxIdType }) => (
  <DetailField
    label="Tax ID"
    type="string"
    value={
      taxId ? (
        <span className="inline-flex items-baseline gap-2">
          <span className="font-mono">{taxId}</span>
          {taxIdType && <span className="text-xs text-muted-foreground">{IDENTIFIER_TYPE_LABELS[taxIdType]}</span>}
        </span>
      ) : null
    }
  />
);
