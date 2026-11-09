// The VAP checkout page — `@vritti/vap-sdk/next/checkout-ui`, styled by `@vritti/vap-sdk/next/checkout-ui.css`.
//
// The same full-screen page on every storefront, under VAP's own header, in the core product's light theme. A
// storefront mounts the two server pages in routes that render none of its own header or footer, and imports the
// stylesheet there:
//
//   // app/(checkout)/checkout/page.tsx
//   import '@vritti/vap-sdk/next/checkout-ui.css';
//   export default function Page({ searchParams }) {
//     return <CheckoutPage searchParams={searchParams} brandName="Desi Taakat" />;
//   }
//   // app/(checkout)/checkout/return/page.tsx
//   export default function Page({ searchParams }) {
//     return <CheckoutResultPage searchParams={searchParams} brandName="Desi Taakat" />;
//   }
//
// Layout: pages/ (server), screens/ (one per state), sections/, forms/, cards/, layout/, hooks/, schemas/, lib/.
// No directive here: this barrel re-exports the client half and the server pages alike.

export * from './client.js';
export type { CheckoutResultSearchParams, CheckoutSearchParams } from './lib/search-params.js';
export { CheckoutPage, type CheckoutPageProps } from './pages/CheckoutPage.js';
export {
  CheckoutResult,
  CheckoutResultPage,
  type CheckoutResultPageProps,
  type CheckoutResultProps,
} from './pages/CheckoutResultPage.js';
