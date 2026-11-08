import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import Decimal from '@vritti/quantum-ui/decimal';
import { useFormatters } from '@vritti/quantum-ui/hooks';
import { TextField } from '@vritti/quantum-ui/TextField';

interface ConversionPreviewProps {
  price: CurrencyValue | undefined;
  poCurrencyCode: string;
  rate: number | undefined;
}

// Read-only preview of a price quoted in another currency, in the PO currency; the stored amount is converted server-side
export const ConversionPreview = ({ price, poCurrencyCode, rate }: ConversionPreviewProps) => {
  const fmt = useFormatters();
  const display =
    price?.value && rate
      ? `${fmt.currency({ currency: poCurrencyCode, value: new Decimal(price.value).times(rate).toString() }).primary} (1 ${price.currency} = ${fmt.number(rate).primary} ${poCurrencyCode})`
      : '—';
  return <TextField label={`Unit Price in ${poCurrencyCode}`} value={display} disabled readOnly />;
};
