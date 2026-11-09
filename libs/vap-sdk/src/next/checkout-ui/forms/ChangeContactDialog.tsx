'use client';

import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type { Checkout, CheckoutCustomer } from '@vritti/vap-sdk';
import { User } from 'lucide-react';
import { type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useChangeCheckoutContact } from '../hooks/checkout-mutations.js';
import type { DialogHandle } from '../hooks/use-dialog-handle.js';
import { type ChangeContactFormData, type ChangeContactFormInput, changeContactSchema } from '../schemas/checkout.js';

interface ChangeContactDialogProps {
  handle: DialogHandle;
  checkoutId: string;
  // The contact the checkout holds now
  current: CheckoutCustomer;
  onChanged: (checkout: Checkout) => void;
}

function toFields(current: CheckoutCustomer): ChangeContactFormInput {
  return { name: current.name ?? '', phone: current.phone ?? '', email: current.email ?? '' };
}

// Changes who the order is for — the name, phone and email the checkout holds, for this order only. The party's
// account details are managed on the storefront
export const ChangeContactDialog: FC<ChangeContactDialogProps> = ({ handle, checkoutId, current, onChanged }) => {
  const form = useForm<ChangeContactFormInput, unknown, ChangeContactFormData>({
    resolver: zodResolver(changeContactSchema),
    defaultValues: toFields(current),
  });
  const mutation = useChangeCheckoutContact(checkoutId, {
    onSuccess: (checkout) => {
      onChanged(checkout);
      handle.close();
    },
  });

  // Each opening starts from the contact the checkout holds
  useEffect(() => {
    if (handle.isOpen) {
      form.reset(toFields(current));
      mutation.reset();
    }
  }, [handle.isOpen, current, form, mutation.reset]);

  const { errors } = form.formState;
  const busy = mutation.isPending;
  return (
    <Dialog
      handle={handle}
      icon={User}
      title="Contact"
      description="Who this order is for. Your account details stay as they are."
    >
      <form
        onSubmit={form.handleSubmit((data) =>
          mutation.mutate({ name: data.name, phone: data.phone, ...(data.email ? { email: data.email } : {}) }),
        )}
      >
        <div className="flex flex-col gap-4 px-6 py-4">
          <TextField
            label="Name"
            autoComplete="name"
            placeholder="Your full name"
            error={errors.name?.message}
            disabled={busy}
            {...form.register('name')}
          />
          <TextField
            label="Phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            description="With the country code; +91 is assumed without one."
            error={errors.phone?.message}
            disabled={busy}
            {...form.register('phone')}
          />
          <TextField
            label="Email (optional)"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            disabled={busy}
            {...form.register('email')}
          />
          {mutation.error ? (
            <p role="alert" className="text-destructive text-sm">
              {mutation.error.message}
            </p>
          ) : null}
        </div>
        <DialogActions>
          <Button type="button" variant="outline" onClick={handle.close} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" isLoading={busy} loadingText="Saving…">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
