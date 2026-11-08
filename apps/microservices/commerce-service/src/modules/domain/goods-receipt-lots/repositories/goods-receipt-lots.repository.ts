import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, eq, getColumns, ne, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import type { CurrencyAmountDto } from '@vritti/api-sdk/money';
import {
  type GoodsReceiptLot,
  goodsReceiptLines,
  goodsReceiptLots,
  type InventoryTracking,
  InventoryTrackingValues,
} from '@/db/schema';

export type GoodsReceiptLotRow = GoodsReceiptLot & {
  linesCount: number;
  totalQuantity: number;
};

@Injectable()
export class GoodsReceiptLotsDomainRepository extends PrimaryBaseRepository<typeof goodsReceiptLots> {
  private static readonly LOT_TRACKINGS: InventoryTracking[] = [
    InventoryTrackingValues.LOT,
    InventoryTrackingValues.LOT_SERIAL,
  ];

  constructor(database: PrimaryDatabaseService) {
    super(database, goodsReceiptLots);
  }

  // Returns the lots of a receipt item with how much of it their lines hold
  async findByItemId(itemId: string): Promise<GoodsReceiptLotRow[]> {
    return this.findAllWithSelect<GoodsReceiptLotRow>({
      select: this.selection(),
      where: eq(goodsReceiptLots.goodsReceiptItemId, itemId),
      orderBy: [asc(goodsReceiptLots.createdAt)],
    });
  }

  // Loads a lot of the given receipt item, throwing when it is not on it
  async findOnItemOrThrow(itemId: string, lotId: string): Promise<GoodsReceiptLotRow> {
    const lot = await this.findById<GoodsReceiptLotRow>(lotId, {
      select: this.selection(),
      where: eq(goodsReceiptLots.goodsReceiptItemId, itemId),
    });
    if (!lot) throw new NotFoundException('Goods receipt lot not found.');
    return lot;
  }

  // Rejects lots on an item that is not tracked by lot
  assertLotTracked(item: { tracking: InventoryTracking }): void {
    if (GoodsReceiptLotsDomainRepository.LOT_TRACKINGS.includes(item.tracking)) return;
    throw new BadRequestException({
      label: 'Lots Not Tracked',
      detail: `This item is tracked by ${item.tracking.toLowerCase()}, so it has no lots.`,
    });
  }

  // Rejects a lot number another lot of the same receipt item already uses
  async assertLotNumberFree(itemId: string, lotNumber: string, excludeLotId?: string): Promise<void> {
    const isTaken = await this.exists(
      and(
        eq(goodsReceiptLots.goodsReceiptItemId, itemId),
        eq(goodsReceiptLots.lotNumber, lotNumber),
        excludeLotId ? ne(goodsReceiptLots.id, excludeLotId) : undefined,
      ) as SQL,
    );
    if (!isTaken) return;
    throw new ConflictException({
      label: 'Lot Already Added',
      detail: `Lot "${lotNumber}" is already on this item. Edit that lot instead.`,
      errors: [{ field: 'lotNumber', message: 'Already on this item' }],
    });
  }

  // Rejects an MRP printed in another currency than the legal entity's
  assertMrpInCurrency(mrp: CurrencyAmountDto | null | undefined, leCurrencyCode: string): void {
    if (!mrp || mrp.currency === leCurrencyCode) return;
    throw new BadRequestException({
      label: 'MRP Currency',
      detail: `The MRP is printed in ${leCurrencyCode}, the company's currency.`,
      errors: [{ field: 'mrp', message: `Enter it in ${leCurrencyCode}` }],
    });
  }

  // Selects a lot with the number of lines it is distributed to and their total quantity
  private selection() {
    const ownLines = eq(goodsReceiptLines.goodsReceiptLotId, goodsReceiptLots.id);
    const totalQuantity = this.db
      .select({ total: sql`coalesce(sum(${goodsReceiptLines.quantity}), 0)` })
      .from(goodsReceiptLines)
      .where(ownLines);
    return {
      ...getColumns(goodsReceiptLots),
      linesCount: this.db.$count(goodsReceiptLines, ownLines),
      totalQuantity: sql<number>`(${totalQuantity})`.mapWith(Number),
    };
  }
}
