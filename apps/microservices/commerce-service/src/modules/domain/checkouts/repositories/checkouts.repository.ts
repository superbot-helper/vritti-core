import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, eq, isNotNull, lt, lte, sql } from '@vritti/api-sdk/drizzle-orm';
import {
  type Checkout,
  type CheckoutLine,
  CheckoutStatusValues,
  checkoutLines,
  checkouts,
  type NewCheckoutLine,
  orders,
} from '@/db/schema';
import type { CheckoutOrderRefDto } from '../dto/entity/checkout.dto';

@Injectable()
export class CheckoutsDomainRepository extends PrimaryBaseRepository<typeof checkouts> {
  constructor(database: PrimaryDatabaseService) {
    super(database, checkouts);
  }

  // The party's OPEN checkout, if any — at most one, by the partial unique index
  async findOpenByParty(partyId: string): Promise<Checkout | undefined> {
    return this.model.findFirst({ where: { partyId, status: CheckoutStatusValues.OPEN } });
  }

  // Serializes checkout starts of one party until the surrounding transaction ends, so two Checkout presses cannot both
  // find no open checkout and both make one
  async lockParty(partyId: string): Promise<void> {
    await this.db.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`checkout:${partyId}`}, 0))`);
  }

  // Marks the party's OPEN checkouts whose window already closed as EXPIRED, so a new one can open
  async expireStaleForParty(partyId: string, now: Date): Promise<void> {
    await this.db
      .update(checkouts)
      .set({ status: CheckoutStatusValues.EXPIRED })
      .where(
        and(
          eq(checkouts.partyId, partyId),
          eq(checkouts.status, CheckoutStatusValues.OPEN),
          lte(checkouts.expiresAt, now),
        ),
      );
  }

  // Open checkouts whose window closed unpaid, whatever payment intents were opened for them
  async findExpired(now: Date, limit: number): Promise<Checkout[]> {
    return this.db
      .select()
      .from(checkouts)
      .where(and(eq(checkouts.status, CheckoutStatusValues.OPEN), lt(checkouts.expiresAt, now)))
      .orderBy(asc(checkouts.expiresAt))
      .limit(limit);
  }

  // Loads a checkout and locks its row until the surrounding transaction ends, so concurrent payment callbacks
  // serialize
  async findByIdForUpdate(id: string): Promise<Checkout | undefined> {
    const [row] = await this.db.select().from(checkouts).where(eq(checkouts.id, id)).limit(1).for('update');
    return row;
  }

  async createLines(data: NewCheckoutLine[]): Promise<CheckoutLine[]> {
    if (data.length === 0) return [];
    return this.db.insert(checkoutLines).values(data).returning() as Promise<CheckoutLine[]>;
  }

  // The lines as they were frozen, in the order they were added
  async findLines(checkoutId: string): Promise<CheckoutLine[]> {
    return this.db
      .select()
      .from(checkoutLines)
      .where(eq(checkoutLines.checkoutId, checkoutId))
      .orderBy(asc(checkoutLines.createdAt));
  }

  // The payment intents that paid a checkout, read from its orders — normally one. Orders carry store-level read
  // policies: call inside a transaction moved into one of the checkout's stores
  async findPaidPaymentIntentIds(checkoutId: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ paymentIntentId: orders.paymentIntentId })
      .from(orders)
      .where(and(eq(orders.checkoutId, checkoutId), isNotNull(orders.paymentIntentId)));
    return rows.flatMap((row) => (row.paymentIntentId ? [row.paymentIntentId] : []));
  }

  // The orders a checkout became, one per store
  async findOrders(checkoutId: string): Promise<CheckoutOrderRefDto[]> {
    return this.db
      .select({
        siteId: orders.siteId,
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        paymentIntentId: orders.paymentIntentId,
      })
      .from(orders)
      .where(eq(orders.checkoutId, checkoutId))
      .orderBy(asc(orders.createdAt));
  }
}
