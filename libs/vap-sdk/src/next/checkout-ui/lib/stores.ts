import type { Cart, Checkout } from '@vritti/vap-sdk';
import type { CheckoutPageStore } from '../types.js';

// The cart's stores with something buyable, as the page lists them
export function storesFromCart(cart: Cart | null): CheckoutPageStore[] {
  return (cart?.sites ?? [])
    .map((site) => ({
      siteId: site.siteId,
      name: site.siteName,
      subtotal: site.subtotal,
      gateways: site.gateways,
      lines: site.items
        .filter((item) => item.isAvailable)
        .map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
    }))
    .filter((store) => store.lines.length > 0);
}

// The checkout's frozen shares as the summary lists them, with each store's lines from the cart
export function storesOfCheckout(checkout: Checkout, stores: CheckoutPageStore[]): CheckoutPageStore[] {
  return checkout.sites.map((share) => {
    const store = stores.find((entry) => entry.siteId === share.siteId);
    return {
      siteId: share.siteId,
      name: store?.name ?? 'Store',
      subtotal: share.subtotal,
      gateways: store?.gateways ?? [],
      lines: store?.lines ?? [],
    };
  });
}

// Items across the stores, counting quantities
export function itemCount(stores: CheckoutPageStore[]): number {
  return stores.reduce((sum, store) => sum + store.lines.reduce((lines, line) => lines + line.quantity, 0), 0);
}
