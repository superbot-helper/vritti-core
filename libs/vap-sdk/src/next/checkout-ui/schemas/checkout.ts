import { z } from '@vritti/quantum-ui/zod';
import { DEFAULT_DIAL_CODE, isValidPhone, normalizePhone } from '@vritti/vap-sdk';

// The address dialog: one of the party's saved addresses
export const changeAddressSchema = z.object({
  addressId: z.uuid('Choose an address.'),
});
export type ChangeAddressFormData = z.infer<typeof changeAddressSchema>;

// A typed phone in international form: as typed when it carries a country code, else under the default one
export function toInternationalPhone(value: string): string {
  const normalized = normalizePhone(value);
  if (!normalized) return '';
  return normalized.startsWith('+') ? normalized : `${DEFAULT_DIAL_CODE}${normalized.replace(/^0+/, '')}`;
}

// The contact dialog: who the order is for. The phone leaves in international form; a blank email means none
export const changeContactSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(255, 'Keep the name under 255 characters.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Enter a phone number.')
    .transform(toInternationalPhone)
    .refine((value) => isValidPhone(value), 'Enter a valid phone number with its country code.'),
  email: z
    .string()
    .trim()
    .max(200, 'Keep the email under 200 characters.')
    .refine((value) => value === '' || z.email().safeParse(value).success, 'Enter a valid email address.'),
});
// What the fields hold, and what the schema makes of them
export type ChangeContactFormInput = z.input<typeof changeContactSchema>;
export type ChangeContactFormData = z.output<typeof changeContactSchema>;

// The payment form: a gateway this page can open, and one of its methods
export const paymentSchema = z.object({
  gatewayCode: z.string().min(1, 'Choose how to pay.'),
  paymentMethod: z.string().min(1, 'Choose a payment method.'),
});
export type PaymentFormData = z.infer<typeof paymentSchema>;
