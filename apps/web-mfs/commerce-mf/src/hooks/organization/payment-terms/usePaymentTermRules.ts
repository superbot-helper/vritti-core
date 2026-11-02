import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PaymentTermRulesData } from '@/schemas/payment-terms';
import { getPaymentTermRules } from '@/services/organization/payment-terms.service';
import { PAYMENT_TERM_RULES_KEY } from './keys';

export function usePaymentTermRules(paymentTermId: string) {
  return useSuspenseQuery<PaymentTermRulesData, AxiosError>({
    queryKey: PAYMENT_TERM_RULES_KEY(paymentTermId),
    queryFn: () => getPaymentTermRules(paymentTermId),
  });
}
