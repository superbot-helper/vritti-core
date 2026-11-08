import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, type RepositoryJoins } from '@vritti/api-sdk/database';
import { and, asc, desc, eq, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import {
  cartItems,
  carts,
  catalogListingPrices,
  catalogListings,
  listingPriceSpecificity,
  offerings,
  offeringVariants,
  partyChannelCatalogId,
} from '@/db/schema';
import type { CartItemRow, StaffCartItemRow } from '../dto/entity/cart.dto';

type PricedLineQuery = RepositoryJoins & { select: Record<string, unknown> };

@Injectable()
export class CartItemsDomainRepository extends PrimaryBaseRepository<typeof cartItems> {
  constructor(database: PrimaryDatabaseService) {
    super(database, cartItems);
  }

  // Every line of one cart
  findByCart(cartId: string, currencyCode: string, appId?: string | null): Promise<CartItemRow[]> {
    return this.findAllWithSelect<CartItemRow>({
      ...this.pricedLine(currencyCode, appId),
      where: eq(cartItems.cartId, cartId),
      orderBy: [asc(cartItems.createdAt)],
    });
  }

  // One cart's lines for the data table — filtered, sorted and paged by the table's own state
  findForTable(
    cartId: string,
    options: { where?: SQL; orderBy: SQL[]; limit: number; offset: number },
    currencyCode: string,
    appId?: string | null,
  ): Promise<{ result: CartItemRow[]; count: number }> {
    return this.findAllAndCount<CartItemRow>({
      ...this.pricedLine(currencyCode, appId),
      where: and(eq(cartItems.cartId, cartId), options.where),
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset,
    });
  }

  // Every line a person holds that this workspace can reach
  findAllForParty(partyId: string, currencyCode: string, appId?: string | null): Promise<StaffCartItemRow[]> {
    return this.findAllWithSelect<StaffCartItemRow>({
      ...this.pricedLine(currencyCode, appId),
      where: eq(carts.partyId, partyId),
      orderBy: [asc(cartItems.createdAt)],
    });
  }

  // A cart line with the variant and offering it names, the listing the shopper's catalogue carries it under, and
  // the price that applies to the reader
  private pricedLine(currencyCode: string, appId?: string | null): PricedLineQuery {
    const price = this.priceLateral(currencyCode);
    return {
      select: {
        id: cartItems.id,
        cartId: carts.id,
        siteId: carts.siteId,
        legalEntityId: carts.legalEntityId,
        catalogListingId: catalogListings.id,
        offeringId: offeringVariants.offeringId,
        offeringVariantId: offeringVariants.id,
        quantity: cartItems.quantity,
        amount: price.amount,
        currencyCode: price.currencyCode,
        code: offeringVariants.code,
        offeringName: offerings.name,
        dimensions: offeringVariants.dimensions,
        attributes: offeringVariants.attributes,
        listingActive: sql<boolean>`${catalogListings.id} is not null`,
        variantActive: offeringVariants.isActive,
        offeringActive: offerings.isActive,
        createdAt: cartItems.createdAt,
      },
      innerJoins: [
        { table: carts, on: eq(carts.id, cartItems.cartId) },
        {
          table: offeringVariants,
          on: and(
            eq(offeringVariants.organizationId, cartItems.organizationId),
            eq(offeringVariants.code, cartItems.code),
          ),
        },
        { table: offerings, on: eq(offerings.id, offeringVariants.offeringId) },
      ],
      leftJoins: [
        {
          table: catalogListings,
          on: and(
            eq(catalogListings.offeringVariantId, offeringVariants.id),
            eq(catalogListings.catalogId, partyChannelCatalogId(sql`${carts.partyId}`, appId)),
          ),
        },
        { table: price, on: undefined, lateral: true },
      ],
    };
  }

  // The price that applies to the reader: reach narrows the rows to the ones this workspace inherits, and the narrowest
  // of those wins — the same precedence the storefront listing resolves with
  private priceLateral(currencyCode: string) {
    return this.db
      .select({ amount: catalogListingPrices.amount, currencyCode: catalogListingPrices.currencyCode })
      .from(catalogListingPrices)
      .where(
        and(
          eq(catalogListingPrices.catalogListingId, catalogListings.id),
          eq(catalogListingPrices.currencyCode, currencyCode),
        ),
      )
      .orderBy(desc(listingPriceSpecificity))
      .limit(1)
      .as('price');
  }
}
