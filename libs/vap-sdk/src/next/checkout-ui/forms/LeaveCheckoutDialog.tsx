'use client';

import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { LogOut } from 'lucide-react';
import type { FC } from 'react';
import type { DialogHandle } from '../hooks/use-dialog-handle.js';
import { formatCountdown } from '../lib/format.js';

interface LeaveCheckoutDialogProps {
  handle: DialogHandle;
  // When the checkout's window closes, for how long the items stay held
  expiresAt: string;
  cancelling: boolean;
  // The same cancel as the Cancel button: the checkout ends, then the cart
  onCancelOrder: () => void;
}

// What the browser's Back opens on the checkout page: leaving means cancelling the order, the same as Cancel
export const LeaveCheckoutDialog: FC<LeaveCheckoutDialogProps> = ({ handle, expiresAt, cancelling, onCancelOrder }) => {
  const left = new Date(expiresAt).getTime() - Date.now();
  return (
    <Dialog
      handle={handle}
      icon={LogOut}
      iconVariant="warning"
      title="Leave checkout?"
      description={
        left > 0
          ? `Your items are held for ${formatCountdown(left)}. To leave, cancel this order.`
          : 'To leave, cancel this order.'
      }
    >
      <DialogActions>
        <Button type="button" variant="outline" onClick={handle.close} disabled={cancelling}>
          Continue paying
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onCancelOrder}
          isLoading={cancelling}
          loadingText="Cancelling…"
        >
          Cancel order
        </Button>
      </DialogActions>
    </Dialog>
  );
};
