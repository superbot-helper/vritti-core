import { Alert } from '@vritti/quantum-ui/Alert';

interface NoTaxIdentityAlertProps {
  partyTaxId: string | null | undefined;
  hasSalesTaxRegistration: boolean | undefined;
}

export const NoTaxIdentityAlert = ({ partyTaxId, hasSalesTaxRegistration }: NoTaxIdentityAlertProps) =>
  partyTaxId === null && hasSalesTaxRegistration === false ? (
    <Alert
      variant="warning"
      description="No sales-tax registration or tax ID on record for this supplier — check how purchases from it are taxed."
    />
  ) : null;
