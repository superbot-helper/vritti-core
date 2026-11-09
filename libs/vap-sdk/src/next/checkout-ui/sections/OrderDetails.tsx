'use client';

import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import type { Checkout, PartyAddress } from '@vritti/vap-sdk';
import { type LucideIcon, MapPin, User } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { type AddressChoice, ChangeAddressDialog } from '../forms/ChangeAddressDialog.js';
import { ChangeContactDialog } from '../forms/ChangeContactDialog.js';
import { useDialogHandle } from '../hooks/use-dialog-handle.js';
import { addressLines } from '../lib/address.js';

interface OrderDetailsProps {
  checkout: Checkout;
  // The party's saved addresses; null when they could not be read
  addresses: PartyAddress[] | null;
  // The storefront's page for adding an address, shown when none is saved
  addUrl?: string;
  disabled?: boolean;
  onChanged: (checkout: Checkout) => void;
}

interface DetailRowProps {
  icon: LucideIcon;
  label: string;
  action?: ReactNode;
  children: ReactNode;
}

// One row of the card: an icon, a small label, the value, and "Change" on the right
const DetailRow: FC<DetailRowProps> = ({ icon: Icon, label, action, children }) => (
  <div className="flex items-start gap-3 px-4 py-3.5">
    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Icon className="size-4 text-muted-foreground" aria-hidden />
    </span>
    <div className="min-w-0 flex-1">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-0.5 text-sm">{children}</div>
    </div>
    {action ? <div className="shrink-0 self-center">{action}</div> : null}
  </div>
);

const Change: FC<{ onClick: () => void; disabled?: boolean; what: string }> = ({ onClick, disabled, what }) => (
  <Button variant="link" size="sm" className="h-auto px-0 font-medium" onClick={onClick} disabled={disabled}>
    Change<span className="sr-only"> {what}</span>
  </Button>
);

// Who the order is for and where it goes — what the checkout holds. Each row's "Change" opens its dialog; both
// change this order only
export const OrderDetails: FC<OrderDetailsProps> = ({ checkout, addresses, addUrl, disabled, onChanged }) => {
  const contactDialog = useDialogHandle();
  const addressDialog = useDialogHandle();
  const choices: AddressChoice[] = (addresses ?? []).map((entry) => ({
    id: entry.id,
    isDefault: entry.isDefault,
    ...addressLines(entry),
  }));
  // The saved address the checkout is delivered to; none when it is for takeaway or the address is no longer listed
  const held = addresses?.find((entry) => entry.id === checkout.partyAddressId);
  const address = held ? Object.values(addressLines(held)).filter(Boolean).join(', ') : null;
  const { customer } = checkout;

  return (
    <section>
      <h2 className="mb-3 font-semibold text-foreground text-xl">Order details</h2>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <DetailRow
          icon={User}
          label="Contact"
          action={<Change what="contact" onClick={contactDialog.open} disabled={disabled} />}
        >
          <div className="font-medium text-foreground">{customer.name ?? 'Add your name'}</div>
          {customer.phone ? <div className="text-muted-foreground">{customer.phone}</div> : null}
        </DetailRow>
        <DetailRow
          icon={MapPin}
          label="Deliver to"
          action={
            choices.length > 0 ? (
              <Change what="delivery address" onClick={addressDialog.open} disabled={disabled} />
            ) : null
          }
        >
          {address ? (
            <div className="font-medium text-foreground">{address}</div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {addresses === null ? 'Your addresses could not be loaded.' : 'You have no saved address yet.'}
              </span>
              {addUrl && addresses !== null ? (
                <Button variant="outline" size="sm" onClick={() => window.location.assign(addUrl)}>
                  Add an address
                </Button>
              ) : null}
            </div>
          )}
        </DetailRow>
      </div>
      {addresses === null ? (
        <Alert
          className="mt-3"
          variant="destructive"
          title="Addresses unavailable"
          description="We could not load your addresses just now. Try again in a moment."
        />
      ) : null}

      <ChangeContactDialog handle={contactDialog} checkoutId={checkout.id} current={customer} onChanged={onChanged} />
      {choices.length > 0 ? (
        <ChangeAddressDialog
          handle={addressDialog}
          checkoutId={checkout.id}
          addresses={choices}
          currentId={checkout.partyAddressId}
          onChanged={onChanged}
        />
      ) : null}
    </section>
  );
};
