import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import Decimal from '@vritti/api-sdk/decimal';
import { and, desc, eq, getColumns, isNull, ne, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { ConflictException, NotFoundException, ValidationException } from '@vritti/api-sdk/exceptions';
import {
  type GoodsReceiptLine,
  goodsReceiptItems,
  goodsReceiptLineItems,
  goodsReceiptLines,
  goodsReceiptLots,
  type InventoryTracking,
  InventoryTrackingValues,
  inventoryItems,
  locations,
  uom,
} from '@/db/schema';

export type GoodsReceiptLineRow = GoodsReceiptLine & {
  locationName: string | null;
  locationPath: string | null;
  lotNumber: string | null;
  lotManufacturingDate: string | null;
  lotExpiryDate: string | null;
  lotMrp: bigint | null;
  primaryUomSymbol: string | null;
  lineItemsCount: number;
};

export interface DistributedReceiptItem {
  id: string;
  siteId: string;
  tracking: InventoryTracking;
  receivedQty: number;
  rejectedQuantity: number;
}

@Injectable()
export class GoodsReceiptLinesDomainRepository extends PrimaryBaseRepository<typeof goodsReceiptLines> {
  private static readonly LOT_TRACKINGS: InventoryTracking[] = [
    InventoryTrackingValues.LOT,
    InventoryTrackingValues.LOT_SERIAL,
  ];
  private static readonly SERIAL_TRACKINGS: InventoryTracking[] = [
    InventoryTrackingValues.SERIAL,
    InventoryTrackingValues.LOT_SERIAL,
  ];

  constructor(database: PrimaryDatabaseService) {
    super(database, goodsReceiptLines);
  }

  // Returns one page of a receipt item's lines, narrowed to one of its lots when given
  async findForTable(
    itemId: string,
    options: { where?: SQL; orderBy: SQL[]; limit: number; offset: number; lotId?: string },
  ): Promise<{ result: GoodsReceiptLineRow[]; count: number }> {
    const { lotId, ...page } = options;
    return this.findAllAndCount<GoodsReceiptLineRow>({
      select: this.selection(),
      leftJoins: this.joins(),
      ...page,
      where: and(
        eq(goodsReceiptLines.goodsReceiptItemId, itemId),
        lotId ? eq(goodsReceiptLines.goodsReceiptLotId, lotId) : undefined,
        page.where,
      ),
    });
  }

  // Returns every line of a receipt item with its location and lot
  async findByItemId(itemId: string): Promise<GoodsReceiptLineRow[]> {
    return this.findAllWithSelect<GoodsReceiptLineRow>({
      select: this.selection(),
      leftJoins: this.joins(),
      where: eq(goodsReceiptLines.goodsReceiptItemId, itemId),
      orderBy: [desc(goodsReceiptLines.createdAt)],
    });
  }

  // Loads a line of the given receipt item, throwing when it is not on it
  async findOnItemOrThrow(itemId: string, lineId: string): Promise<GoodsReceiptLineRow> {
    const line = await this.findById<GoodsReceiptLineRow>(lineId, {
      select: this.selection(),
      leftJoins: this.joins(),
      where: eq(goodsReceiptLines.goodsReceiptItemId, itemId),
    });
    if (!line) throw new NotFoundException('Goods receipt line not found.');
    return line;
  }

  // Rejects a lot that does not suit the item: lot-tracked items need one of their own lots, the others take none
  async assertLotFitsItem(item: DistributedReceiptItem, goodsReceiptLotId: string | null): Promise<void> {
    const isLotTracked = GoodsReceiptLinesDomainRepository.LOT_TRACKINGS.includes(item.tracking);
    if (!isLotTracked && goodsReceiptLotId === null) return;
    if (!isLotTracked) {
      throw new ValidationException({
        label: 'Lot Not Tracked',
        detail: `This item is tracked by ${item.tracking.toLowerCase()}, so its lines take no lot.`,
        errors: [{ field: 'goodsReceiptLotId', message: 'Not tracked by lot' }],
      });
    }
    if (goodsReceiptLotId === null) {
      throw new ValidationException({
        label: 'Lot Required',
        detail: 'This item is tracked by lot; pick the lot the line holds.',
        errors: [{ field: 'goodsReceiptLotId', message: 'Lot is required' }],
      });
    }
    const [lot] = await this.db
      .select({ id: goodsReceiptLots.id })
      .from(goodsReceiptLots)
      .where(and(eq(goodsReceiptLots.id, goodsReceiptLotId), eq(goodsReceiptLots.goodsReceiptItemId, item.id)))
      .limit(1);
    if (lot) return;
    throw new ValidationException({
      label: 'Unknown Lot',
      detail: "The lot is not one of this item's lots on the goods receipt.",
      errors: [{ field: 'goodsReceiptLotId', message: 'Not a lot of this item' }],
    });
  }

  // Rejects a zero-quantity line unless its serials are still to be scanned
  assertQuantityAllowed(item: DistributedReceiptItem, quantity: number): void {
    if (quantity > 0 || GoodsReceiptLinesDomainRepository.SERIAL_TRACKINGS.includes(item.tracking)) return;
    throw new ValidationException({
      label: 'Quantity Required',
      detail: 'Enter how much of the item this line holds.',
      errors: [{ field: 'quantity', message: 'Must be more than 0' }],
    });
  }

  // Rejects lines that would hold more than the item's accepted (received less rejected) quantity
  async assertWithinAcceptedQuantity(
    item: DistributedReceiptItem,
    quantity: number,
    excludeLineId?: string,
  ): Promise<void> {
    const [{ total }] = await this.db
      .select({ total: sql<string>`coalesce(sum(${goodsReceiptLines.quantity}), 0)` })
      .from(goodsReceiptLines)
      .where(
        and(
          eq(goodsReceiptLines.goodsReceiptItemId, item.id),
          excludeLineId ? ne(goodsReceiptLines.id, excludeLineId) : undefined,
        ),
      );
    const accepted = new Decimal(item.receivedQty).minus(item.rejectedQuantity);
    const remaining = accepted.minus(total);
    if (remaining.gte(quantity)) return;
    throw new ValidationException({
      label: 'Exceeds Accepted Quantity',
      detail: `Only ${remaining.toString()} of the ${accepted.toString()} accepted is not on a line yet.`,
      errors: [{ field: 'quantity', message: `At most ${remaining.toString()}` }],
    });
  }

  // Rejects a second line for the same item, lot and location
  async assertLocationFree(
    itemId: string,
    line: { goodsReceiptLotId: string | null; locationId: string },
    excludeLineId?: string,
  ): Promise<void> {
    const isTaken = await this.exists(
      and(
        eq(goodsReceiptLines.goodsReceiptItemId, itemId),
        eq(goodsReceiptLines.locationId, line.locationId),
        line.goodsReceiptLotId === null
          ? isNull(goodsReceiptLines.goodsReceiptLotId)
          : eq(goodsReceiptLines.goodsReceiptLotId, line.goodsReceiptLotId),
        excludeLineId ? ne(goodsReceiptLines.id, excludeLineId) : undefined,
      ) as SQL,
    );
    if (!isTaken) return;
    throw new ConflictException({
      label: 'Duplicate Line',
      detail: 'A line for this location already exists on this item. Edit that line instead.',
      errors: [{ field: 'locationId', message: 'Already has a line' }],
    });
  }

  // Marks a line balanced: always when it carries no serials, otherwise once its serial count matches its quantity
  async refreshIsBalanced(lineId: string, tracking: InventoryTracking): Promise<void> {
    if (!GoodsReceiptLinesDomainRepository.SERIAL_TRACKINGS.includes(tracking)) {
      await this.update(lineId, { isBalanced: true });
      return;
    }
    const serialCount = this.db.$count(
      goodsReceiptLineItems,
      eq(goodsReceiptLineItems.goodsReceiptLineId, goodsReceiptLines.id),
    );
    await this.db
      .update(goodsReceiptLines)
      .set({ isBalanced: sql<boolean>`${goodsReceiptLines.quantity} = ${serialCount}` })
      .where(eq(goodsReceiptLines.id, lineId));
  }

  // Selects a line with its location, its lot and the item's primary unit
  private selection() {
    return {
      ...getColumns(goodsReceiptLines),
      locationName: locations.name,
      locationPath: locations.pathBreadcrumb,
      lotNumber: goodsReceiptLots.lotNumber,
      lotManufacturingDate: goodsReceiptLots.manufacturingDate,
      lotExpiryDate: goodsReceiptLots.expiryDate,
      lotMrp: goodsReceiptLots.mrp,
      primaryUomSymbol: uom.symbol,
      lineItemsCount: this.db.$count(
        goodsReceiptLineItems,
        eq(goodsReceiptLineItems.goodsReceiptLineId, goodsReceiptLines.id),
      ),
    };
  }

  // Joins the lot, the location, and the item's primary unit through the receipt item
  private joins() {
    return [
      { table: goodsReceiptLots, on: eq(goodsReceiptLots.id, goodsReceiptLines.goodsReceiptLotId) },
      { table: locations, on: eq(locations.id, goodsReceiptLines.locationId) },
      { table: goodsReceiptItems, on: eq(goodsReceiptItems.id, goodsReceiptLines.goodsReceiptItemId) },
      { table: inventoryItems, on: eq(inventoryItems.id, goodsReceiptItems.inventoryItemId) },
      { table: uom, on: eq(uom.id, inventoryItems.uomId) },
    ];
  }
}
