'use client';

import { cn } from '@vritti/quantum-ui/cn';
import type { Checkout, PartyAddress } from '@vritti/vap-sdk';
import { type FC, useMemo, useState } from 'react';
import { ClosedCard } from '../cards/ClosedCard.js';
import { FailedCard } from '../cards/FailedCard.js';
import { StartCard } from '../cards/StartCard.js';
import { LeaveCheckoutDialog } from '../forms/LeaveCheckoutDialog.js';
import { PaymentForm } from '../forms/PaymentForm.js';
import { useBackGuard, useReloadOnRestore } from '../hooks/use-back-guard.js';
import { useDialogHandle } from '../hooks/use-dialog-handle.js';
import { useVapCheckout } from '../hooks/use-vap-checkout.js';
import { CheckoutFrame } from '../layout/CheckoutFrame.js';
import { ExpiryTimer } from '../layout/ExpiryTimer.js';
import { failureInWords, gatewayName } from '../lib/gateways.js';
import { isLive } from '../lib/outcome.js';
import { paymentDefaults } from '../lib/payment-defaults.js';
import { openableGateways, VAP_CHECKOUT_PLUGINS } from '../lib/plugins.js';
import { storesOfCheckout } from '../lib/stores.js';
import type { PaymentFormData } from '../schemas/checkout.js';
import { CheckoutAlerts } from '../sections/CheckoutAlerts.js';
import { GatewayHandoff } from '../sections/GatewayHandoff.js';
import { MobilePayBar } from '../sections/MobilePayBar.js';
import { OrderDetails } from '../sections/OrderDetails.js';
import { OrderSummary } from '../sections/OrderSummary.js';
import { PaymentActions } from '../sections/PaymentActions.js';
import { PolicyLinks } from '../sections/PolicyLinks.js';
import {
  type CheckoutPageStore,
  type CheckoutPaths,
  type CheckoutPolicyLink,
  type CheckoutReturn,
  STORE_HOME,
} from '../types.js';

interface PayScreenProps {
  brandName: string;
  // The store's logo at the top of the order summary; its name in type without one
  brandLogoUrl?: string | null;
  // The store's policy pages, under the form
  policyLinks?: CheckoutPolicyLink[];
  // The cart's stores, for each store's lines and gateways
  stores: CheckoutPageStore[];
  // Gateways that pay every store in one payment
  togetherGateways: string[];
  // Each gateway's catalog logo, by code
  gatewayLogos: Record<string, string | null>;
  addresses: PartyAddress[] | null;
  // The open checkout the page shows — made by the storefront cart's Checkout button
  checkout: Checkout;
  // What the gateway said when it sent the shopper back
  returned: CheckoutReturn;
  paths: CheckoutPaths;
}

// The VAP checkout page, one page over one checkout: who it is for and where it goes, how to pay, Pay with Cancel
// beside it, and the order summary in the column beside them. Identical on every storefront; each part lives in its
// own section or form
export const PayScreen: FC<PayScreenProps> = (props) => {
  const { brandName, stores, addresses, paths } = props;
  const flow = useVapCheckout({
    plugins: VAP_CHECKOUT_PLUGINS,
    paths,
    brandName,
    initialCheckout: props.checkout,
  });
  const [returned, setReturned] = useState<CheckoutReturn>(props.returned);

  // The checkout says what is paid for: one store, or every store of the cart
  const sites = props.checkout.sites;
  const gateways = useMemo(() => {
    if (sites.length === 1) {
      return openableGateways(stores.find((store) => store.siteId === sites[0].siteId)?.gateways ?? []);
    }
    return openableGateways(props.togetherGateways);
  }, [sites, stores, props.togetherGateways]);
  const summaryStores = useMemo(() => storesOfCheckout(props.checkout, stores), [props.checkout, stores]);

  // The browser's Back opens the leave dialog rather than leaving, while the checkout is live and nothing is under
  // way: never while the gateway opens (the browser is meant to leave, and a payment window uses Back to close), nor
  // once Cancel has started
  const leaveDialog = useDialogHandle();
  const paying = flow.pay.isPending || (flow.pay.isSuccess && flow.pay.data === 'leaving');
  const cancelling = flow.cancel.isPending || flow.cancel.isSuccess;
  const guarded = Boolean(flow.checkout && isLive(flow.checkout)) && stores.length > 0 && !paying && !cancelling;
  useBackGuard(guarded, leaveDialog.open);
  // Back from the gateway's page can bring this page back exactly as it was left; read it afresh instead
  useReloadOnRestore();

  const checkout = flow.checkout;
  // Expired on this page: start again from the cart
  if (!checkout) {
    return (
      <CheckoutFrame>
        <StartCard
          kind="expired"
          siteId={sites.length === 1 ? sites[0].siteId : undefined}
          checkoutPath={paths.checkout}
          backUrl={paths.cart}
          backLabel={`Back to ${brandName}`}
        />
      </CheckoutFrame>
    );
  }
  if (stores.length === 0) {
    return (
      <CheckoutFrame>
        <ClosedCard kind="empty" backUrl={STORE_HOME} backLabel={`Back to ${brandName}`} />
      </CheckoutFrame>
    );
  }

  const last = checkout.paymentIntent;
  const pay = (data: PaymentFormData) => {
    setReturned({});
    flow.pay.mutate(data);
  };
  const clearReturn = () => {
    setReturned({});
    // The entry's state is kept: the router's, and the Back guard's flag
    window.history.replaceState(
      window.history.state,
      '',
      `${paths.checkout}?checkout=${encodeURIComponent(checkout.id)}`,
    );
  };
  const timer = isLive(checkout) ? (
    <ExpiryTimer expiresAt={checkout.expiresAt} paused={paying} onExpire={flow.discard} />
  ) : null;
  const leave = (
    <LeaveCheckoutDialog
      handle={leaveDialog}
      expiresAt={checkout.expiresAt}
      cancelling={cancelling}
      onCancelOrder={() => flow.cancel.mutate()}
    />
  );

  // ── Back from the gateway unpaid ──
  if (returned.outcome === 'failed' && last) {
    return (
      <CheckoutFrame timer={timer}>
        <FailedCard
          checkout={checkout}
          reason={failureInWords(last.failure ?? { message: returned.message ?? null })}
          busy={paying}
          onRetry={() => pay({ gatewayCode: last.gatewayCode, paymentMethod: last.method ?? '' })}
          onChange={clearReturn}
        />
        {leave}
      </CheckoutFrame>
    );
  }

  const defaults = paymentDefaults(gateways, last);
  const { gatewayCode } = defaults;
  const hasAddress = Boolean(checkout.partyAddressId);
  const hint = !hasAddress
    ? 'Add a delivery address to continue.'
    : gateways.length === 0
      ? 'Online payments are not set up for this order yet.'
      : null;
  const label = gatewayCode ? gatewayName(gatewayCode) : 'the gateway';
  const actions = (
    <PaymentActions
      total={checkout.total}
      gatewayLabel={label}
      paying={paying}
      cancelling={cancelling}
      payDisabled={!hasAddress || gateways.length === 0}
      onCancel={() => flow.cancel.mutate()}
    />
  );

  return (
    <CheckoutFrame
      timer={timer}
      summary={
        <OrderSummary
          stores={summaryStores}
          total={checkout.total}
          brandName={brandName}
          brandLogoUrl={props.brandLogoUrl ?? null}
        />
      }
    >
      <div className="flex flex-col gap-8 pb-36 lg:pb-0">
        <CheckoutAlerts
          cancelledAt={returned.outcome === 'cancelled' ? (last ? gatewayName(last.gatewayCode) : 'gateway') : null}
          onDismissCancelled={clearReturn}
          error={flow.pay.error?.message ?? flow.cancel.error?.message ?? null}
          dismissed={flow.pay.isSuccess && flow.pay.data === 'dismissed'}
          notPayableTogether={sites.length > 1 && gateways.length === 0}
        />
        <OrderDetails
          checkout={checkout}
          addresses={addresses}
          addUrl={paths.addresses}
          disabled={paying || cancelling}
          onChanged={flow.replace}
        />
        <section>
          <h2 className="font-semibold text-foreground text-xl">Payment</h2>
          <p className="mt-1 mb-4 text-muted-foreground text-sm">Choose how you’d like to pay.</p>
          {paying ? <GatewayHandoff gateway={label} /> : null}
          {/* Kept mounted while the gateway opens, so a closed payment window returns to the same choices */}
          <div className={cn(paying && 'hidden')}>
            <PaymentForm
              gateways={gateways}
              gatewayLogos={props.gatewayLogos}
              defaultValues={defaults}
              disabled={paying || cancelling}
              onPay={pay}
            />
          </div>
          {/* Desktop: Cancel and Pay under the payment choices; phones have them in the pay bar */}
          <div className="mt-6 hidden flex-col gap-3 lg:flex">
            {actions}
            {hint ? <p className="text-muted-foreground text-sm">{hint}</p> : null}
          </div>
        </section>
        <PolicyLinks links={props.policyLinks ?? []} />
      </div>

      <MobilePayBar total={checkout.total} storeCount={summaryStores.length} actions={actions} hint={hint} />
      {leave}
    </CheckoutFrame>
  );
};
