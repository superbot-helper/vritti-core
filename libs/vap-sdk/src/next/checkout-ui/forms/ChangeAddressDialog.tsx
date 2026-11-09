'use client';

import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { RadioGroup } from '@vritti/quantum-ui/RadioGroup';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type { Checkout } from '@vritti/vap-sdk';
import { MapPin } from 'lucide-react';
import { type FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useChangeCheckoutAddress } from '../hooks/checkout-mutations.js';
import type { DialogHandle } from '../hooks/use-dialog-handle.js';
import type { AddressLines } from '../lib/address.js';
import { type ChangeAddressFormData, changeAddressSchema } from '../schemas/checkout.js';

export type AddressChoice = AddressLines & { id: string; isDefault: boolean };

interface ChangeAddressDialogProps {
  handle: DialogHandle;
  checkoutId: string;
  addresses: AddressChoice[];
  // The address the checkout holds now
  currentId: string | null;
  onChanged: (checkout: Checkout) => void;
}

// Delivers the checkout to another of the party's saved addresses — for this order only. Adding or editing addresses
// stays on the storefront
export const ChangeAddressDialog: FC<ChangeAddressDialogProps> = ({
  handle,
  checkoutId,
  addresses,
  currentId,
  onChanged,
}) => {
  const form = useForm<ChangeAddressFormData>({
    resolver: zodResolver(changeAddressSchema),
    defaultValues: { addressId: currentId ?? addresses[0]?.id ?? '' },
  });
  const mutation = useChangeCheckoutAddress(checkoutId, {
    onSuccess: (checkout) => {
      onChanged(checkout);
      handle.close();
    },
  });

  // Each opening starts from the address the checkout holds
  useEffect(() => {
    if (handle.isOpen) {
      form.reset({ addressId: currentId ?? addresses[0]?.id ?? '' });
      mutation.reset();
    }
  }, [handle.isOpen, currentId, addresses, form, mutation.reset]);

  return (
    <Dialog
      handle={handle}
      icon={MapPin}
      title="Deliver to"
      description="Choose where this order goes. Your saved addresses are managed on the store."
    >
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
          <Controller
            control={form.control}
            name="addressId"
            render={({ field, fieldState }) => (
              <RadioGroup
                variant="card"
                name={field.name}
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={mutation.isPending}
                error={fieldState.error?.message ?? mutation.error?.message}
                options={addresses.map((address) => ({
                  value: address.id,
                  label: address.isDefault ? `${address.first} · Default` : address.first,
                  description: address.second,
                }))}
              />
            )}
          />
        </div>
        <DialogActions>
          <Button type="button" variant="outline" onClick={handle.close} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending} loadingText="Saving…">
            Deliver here
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
