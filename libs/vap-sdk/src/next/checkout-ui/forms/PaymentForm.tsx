'use client';

import { zodResolver } from '@vritti/quantum-ui/zod';
import type { FC, ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { type PaymentFormData, paymentSchema } from '../schemas/checkout.js';
import { GatewayField } from './fields/GatewayField.js';
import { MethodField } from './fields/MethodField.js';

// The form's id, so a submit button outside it (the mobile pay bar) can submit it
export const PAYMENT_FORM_ID = 'vap-payment-form';

interface PaymentFormProps {
  gateways: string[];
  // Each gateway's catalog logo, by code
  gatewayLogos: Record<string, string | null>;
  defaultValues: PaymentFormData;
  disabled?: boolean;
  onPay: (data: PaymentFormData) => void;
  // The actions under the fields (desktop); the mobile pay bar submits by PAYMENT_FORM_ID
  actions?: ReactNode;
}

// How to pay: the gateway, then the method its page opens on. Submitting it is Pay
export const PaymentForm: FC<PaymentFormProps> = ({
  gateways,
  gatewayLogos,
  defaultValues,
  disabled,
  onPay,
  actions,
}) => {
  const form = useForm<PaymentFormData>({ resolver: zodResolver(paymentSchema), defaultValues });
  return (
    <FormProvider {...form}>
      <form id={PAYMENT_FORM_ID} onSubmit={form.handleSubmit(onPay)} className="flex flex-col gap-7">
        <GatewayField gateways={gateways} logos={gatewayLogos} disabled={disabled} />
        <MethodField disabled={disabled} />
        {actions}
      </form>
    </FormProvider>
  );
};
