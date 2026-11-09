import type { CheckoutCustomerDto } from '@domain/orders/dto/entity/order-checkout.dto';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import { type Checkout, type CheckoutLine, type CheckoutStatus, CheckoutStatusValues } from '@/db/schema';

// One store's share of a checkout — what its payout leg is sized from
export class CheckoutSiteShareDto {
  siteId: string;
  legalEntityId: string;
  // Minor units as a string, so the payment is split for the exact amount
  subtotalMinor: string;

  static fromLines(lines: CheckoutLine[]): CheckoutSiteShareDto[] {
    const shares = new Map<string, CheckoutSiteShareDto>();
    for (const line of lines) {
      const share =
        shares.get(line.siteId) ??
        Object.assign(new CheckoutSiteShareDto(), {
          siteId: line.siteId,
          legalEntityId: line.legalEntityId,
          subtotalMinor: '0',
        });
      share.subtotalMinor = (BigInt(share.subtotalMinor) + line.lineTotal).toString();
      shares.set(line.siteId, share);
    }
    return [...shares.values()];
  }
}

// A checkout as it was frozen; payment intents are opened for it afterwards
export class CheckoutStartedDto {
  checkoutId: string;
  status: CheckoutStatus;
  currencyCode: string;
  total: CurrencyAmountDto;
  // The same total in minor units, as a string so the payment intent is created for the exact amount
  totalMinor: string;
  // When the payment window closes; every intent opened for it is given the same deadline
  expiresAt: string;
  customer: CheckoutCustomerDto | null;
  sites: CheckoutSiteShareDto[];
  // True when the checkout key answered with a checkout it had already opened, false for a new one
  reused: boolean;

  static from(
    entity: Checkout,
    lines: CheckoutLine[],
    customer: CheckoutCustomerDto | null,
    reused = false,
  ): CheckoutStartedDto {
    const dto = new CheckoutStartedDto();
    dto.checkoutId = entity.id;
    dto.status = entity.status;
    dto.currencyCode = entity.currencyCode;
    dto.total = CurrencyAmountDto.from(entity.totalAmount, entity.currencyCode);
    dto.totalMinor = entity.totalAmount.toString();
    dto.expiresAt = entity.expiresAt.toISOString();
    dto.customer = customer;
    dto.sites = CheckoutSiteShareDto.fromLines(lines);
    dto.reused = reused;
    return dto;
  }
}

// One order a checkout became, at one store
export class CheckoutOrderRefDto {
  siteId: string;
  orderId: string;
  orderNumber: string;
  // The payment intent that paid it
  paymentIntentId: string | null;
}

// Where a checkout stands: its stores' shares, and the orders it has become
export class CheckoutStatusDto {
  checkoutId: string;
  status: CheckoutStatus;
  currencyCode: string;
  total: CurrencyAmountDto;
  totalMinor: string;
  // When the window closes (OPEN), or closed: the deadline that passed (EXPIRED), the moment it was ended (CANCELLED)
  // or the moment it was paid (PAID, CONVERTED)
  expiresAt: string;
  // The same moment, named: set once the checkout is paid
  paidAt: string | null;
  customer: CheckoutCustomerDto;
  // The party's saved address the orders are delivered to
  partyAddressId: string | null;
  sites: CheckoutSiteShareDto[];
  orders: CheckoutOrderRefDto[];

  static from(entity: Checkout, lines: CheckoutLine[], orders: CheckoutOrderRefDto[]): CheckoutStatusDto {
    const dto = new CheckoutStatusDto();
    dto.checkoutId = entity.id;
    dto.status = entity.status;
    dto.currencyCode = entity.currencyCode;
    dto.total = CurrencyAmountDto.from(entity.totalAmount, entity.currencyCode);
    dto.totalMinor = entity.totalAmount.toString();
    dto.expiresAt = entity.expiresAt.toISOString();
    dto.paidAt = isPaid(entity.status) ? entity.expiresAt.toISOString() : null;
    dto.customer = { name: entity.customerName, phone: entity.customerPhone, email: entity.customerEmail };
    dto.partyAddressId = entity.partyAddressId;
    dto.sites = CheckoutSiteShareDto.fromLines(lines);
    dto.orders = orders;
    return dto;
  }
}

// A checkout the money has landed for, whether or not its orders are made yet
function isPaid(status: CheckoutStatus): boolean {
  return status === CheckoutStatusValues.PAID || status === CheckoutStatusValues.CONVERTED;
}
