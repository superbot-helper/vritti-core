'use client';

import { useCallback, useMemo, useState } from 'react';

// The shape Quantum's `Dialog` takes as `handle` (its own type is not exported from the Dialog entry)
export type DialogHandle = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  onOpenChange: (open: boolean) => void;
};

// The handle Quantum's `Dialog` takes, kept here rather than imported from `@vritti/quantum-ui/hooks`: that barrel
// imports react-router-dom, which a storefront does not have
export function useDialogHandle(): DialogHandle {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  return useMemo(() => ({ isOpen, open, close, onOpenChange: setOpen }), [isOpen, open, close]);
}
