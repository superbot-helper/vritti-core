import { keepPreviousData, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PaymentScheduleData, PaymentScheduleQuery } from '@/schemas/payment-terms';
import { getPaymentSchedule } from '@/services/organization/payment-terms.service';
import { PAYMENT_TERM_SCHEDULE_KEY } from './keys';

type UsePaymentScheduleOptions = Omit<UseQueryOptions<PaymentScheduleData, AxiosError>, 'queryKey' | 'queryFn'>;

export function usePaymentSchedule(
  paymentTermId: string,
  query: PaymentScheduleQuery,
  options?: UsePaymentScheduleOptions,
) {
  return useQuery<PaymentScheduleData, AxiosError>({
    queryKey: PAYMENT_TERM_SCHEDULE_KEY(paymentTermId, query),
    queryFn: () => getPaymentSchedule(paymentTermId, query),
    placeholderData: keepPreviousData,
    ...options,
  });
}
