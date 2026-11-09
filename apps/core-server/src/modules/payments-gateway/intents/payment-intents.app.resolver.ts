import { Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthType, Require } from '@vritti/api-sdk/auth';
import { SITE_PAYMENTS } from '@vritti/commerce-permissions/payments';
import { AppTypeValues } from '@/db/schema';
import { RequireFeature, RequirePermission } from '@/rbac/decorators';
import { AppId, LegalEntityId, OptionalPartyId, OrgId, PartyId, RequestOrigin, SiteId } from '@/security/decorators';
import {
  CheckoutAddressInput,
  CheckoutContactInput,
  CheckoutRefInput,
  CheckoutStartInput,
  ConfirmPaymentInput,
  CreatePaymentIntentInput,
  PaymentIntentRefInput,
} from './graphql/payment-intent.input';
import { Checkout, PaymentIntent } from './graphql/payment-intent.type';
import { PaymentIntentsGatewayService } from './services/payment-intents-gateway.service';

@Resolver()
@Require(AuthType.App, AppTypeValues.GRAPHQL)
@RequireFeature(SITE_PAYMENTS.featureCode)
export class PaymentIntentsAppResolver {
  private readonly logger = new Logger(PaymentIntentsAppResolver.name);

  constructor(private readonly service: PaymentIntentsGatewayService) {}

  // Opens a payment for anything the app sells, or for a checkout, through the gateway the shopper picked
  @Mutation(() => PaymentIntent, { name: 'createPaymentIntent' })
  @RequirePermission(SITE_PAYMENTS.create)
  createPaymentIntent(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @OptionalPartyId() partyId: string | undefined,
    @SiteId() siteId: string | undefined,
    @LegalEntityId() legalEntityId: string | undefined,
    @RequestOrigin() origin: string | undefined,
    @Args('input') input: CreatePaymentIntentInput,
  ): Promise<PaymentIntent> {
    this.logger.log('MUTATION createPaymentIntent');
    return this.service.create({ orgId, appId, partyId, siteId, legalEntityId, origin }, input);
  }

  // Completes a payment from what the gateway's checkout handed back
  @Mutation(() => PaymentIntent, { name: 'confirmPayment' })
  @RequirePermission(SITE_PAYMENTS.create)
  confirmPayment(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @OptionalPartyId() partyId: string | undefined,
    @Args('input') input: ConfirmPaymentInput,
  ): Promise<PaymentIntent> {
    this.logger.log('MUTATION confirmPayment');
    return this.service.confirm({ orgId, appId, partyId }, input);
  }

  @Query(() => PaymentIntent, { name: 'paymentIntent' })
  @RequirePermission(SITE_PAYMENTS.view)
  paymentIntent(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @OptionalPartyId() partyId: string | undefined,
    @Args('input') input: PaymentIntentRefInput,
  ): Promise<PaymentIntent> {
    this.logger.log('QUERY paymentIntent');
    return this.service.findById({ orgId, appId, partyId }, input.paymentIntentId);
  }

  @Mutation(() => PaymentIntent, { name: 'cancelPaymentIntent' })
  @RequirePermission(SITE_PAYMENTS.cancel)
  cancelPaymentIntent(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @OptionalPartyId() partyId: string | undefined,
    @Args('input') input: PaymentIntentRefInput,
  ): Promise<PaymentIntent> {
    this.logger.log('MUTATION cancelPaymentIntent');
    return this.service.cancel({ orgId, appId, partyId }, input.paymentIntentId);
  }

  // Freezes the party's cart — every store, or one — into a checkout; its payment is opened by createPaymentIntent
  @Mutation(() => Checkout, { name: 'startCheckout' })
  @RequirePermission(SITE_PAYMENTS.create)
  startCheckout(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @PartyId() partyId: string,
    @Args('input') input: CheckoutStartInput,
  ): Promise<Checkout> {
    this.logger.log('MUTATION startCheckout');
    return this.service.startCheckout({ orgId, appId, partyId }, input);
  }

  // Delivers one of the party's open checkouts to another of their saved addresses
  @Mutation(() => Checkout, { name: 'changeCheckoutAddress' })
  @RequirePermission(SITE_PAYMENTS.create)
  changeCheckoutAddress(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @PartyId() partyId: string,
    @Args('input') input: CheckoutAddressInput,
  ): Promise<Checkout> {
    this.logger.log('MUTATION changeCheckoutAddress');
    return this.service.changeCheckoutAddress({ orgId, appId, partyId }, input.checkoutId, input.addressId);
  }

  // Changes who one of the party's open checkouts is for — the contact it holds, for this order only
  @Mutation(() => Checkout, { name: 'changeCheckoutContact' })
  @RequirePermission(SITE_PAYMENTS.create)
  changeCheckoutContact(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @PartyId() partyId: string,
    @Args('input') input: CheckoutContactInput,
  ): Promise<Checkout> {
    this.logger.log('MUTATION changeCheckoutContact');
    return this.service.changeCheckoutContact({ orgId, appId, partyId }, input);
  }

  // Ends one of the party's open checkouts at the shopper's request, with its payments still waiting on them
  @Mutation(() => Checkout, { name: 'cancelCheckout' })
  @RequirePermission(SITE_PAYMENTS.cancel)
  cancelCheckout(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @PartyId() partyId: string,
    @Args('input') input: CheckoutRefInput,
  ): Promise<Checkout> {
    this.logger.log('MUTATION cancelCheckout');
    return this.service.cancelCheckout({ orgId, appId, partyId }, input.checkoutId);
  }

  // The party's open, live checkout, or null — for the storefront's "checkout in progress" card
  @Query(() => Checkout, { name: 'activeCheckout', nullable: true })
  @RequirePermission(SITE_PAYMENTS.view)
  activeCheckout(@OrgId() orgId: string, @AppId() appId: string, @PartyId() partyId: string): Promise<Checkout | null> {
    this.logger.log('QUERY activeCheckout');
    return this.service.activeCheckout({ orgId, appId, partyId });
  }

  // Where a checkout stands — its payment, and the orders it became — for a return page
  @Query(() => Checkout, { name: 'checkout' })
  @RequirePermission(SITE_PAYMENTS.view)
  checkout(
    @OrgId() orgId: string,
    @AppId() appId: string,
    @PartyId() partyId: string,
    @Args('input') input: CheckoutRefInput,
  ): Promise<Checkout> {
    this.logger.log('QUERY checkout');
    return this.service.findCheckout({ orgId, appId, partyId }, input.checkoutId);
  }
}
