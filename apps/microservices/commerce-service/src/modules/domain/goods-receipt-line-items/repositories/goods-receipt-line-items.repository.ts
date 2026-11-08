import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import {
  type GoodsReceiptLineItem,
  goodsReceiptLineItems,
  type InventoryTracking,
  InventoryTrackingValues,
  inventoryItemSerials,
} from '@/db/schema';

@Injectable()
export class GoodsReceiptLineItemsDomainRepository extends PrimaryBaseRepository<typeof goodsReceiptLineItems> {
  private static readonly SERIAL_TRACKINGS: InventoryTracking[] = [
    InventoryTrackingValues.SERIAL,
    InventoryTrackingValues.LOT_SERIAL,
  ];

  constructor(database: PrimaryDatabaseService) {
    super(database, goodsReceiptLineItems);
  }

  // Returns the serials registered on a line, oldest first
  async findByLineId(lineId: string): Promise<GoodsReceiptLineItem[]> {
    return this.findAllWithSelect({
      where: eq(goodsReceiptLineItems.goodsReceiptLineId, lineId),
      orderBy: [asc(goodsReceiptLineItems.createdAt)],
    });
  }

  // Returns one page of the serials registered on a line
  async findForTable(
    lineId: string,
    options: { where?: SQL; orderBy: SQL[]; limit: number; offset: number },
  ): Promise<{ result: GoodsReceiptLineItem[]; count: number }> {
    return this.findAllAndCount({
      ...options,
      where: and(eq(goodsReceiptLineItems.goodsReceiptLineId, lineId), options.where),
    });
  }

  // Loads a serial of the given line, throwing when it is not on it
  async findOnLineOrThrow(lineId: string, lineItemId: string): Promise<GoodsReceiptLineItem> {
    const lineItem = await this.findOne({ id: lineItemId, goodsReceiptLineId: lineId });
    if (!lineItem) throw new NotFoundException('Serial not found on this line.');
    return lineItem;
  }

  // Rejects serials on an item that is not tracked by serial
  assertSerialTracked(item: { tracking: InventoryTracking }): void {
    if (GoodsReceiptLineItemsDomainRepository.SERIAL_TRACKINGS.includes(item.tracking)) return;
    throw new BadRequestException({
      label: 'Serials Not Tracked',
      detail: `This item is tracked by ${item.tracking.toLowerCase()}, so it has no serials.`,
    });
  }

  // Rejects a serial beyond the line's quantity
  async assertLineHasRoom(line: { id: string; quantity: number }): Promise<void> {
    const serialCount = await this.count(eq(goodsReceiptLineItems.goodsReceiptLineId, line.id));
    if (serialCount < line.quantity) return;
    throw new ConflictException({
      label: 'Line Full',
      detail: `This line already has its ${line.quantity} serials. Increase the line quantity to add more.`,
      errors: [{ field: 'serialNumber', message: 'Line is full' }],
    });
  }

  // Rejects a serial already on the line or already registered in inventory — a receipt only registers new serials
  async assertSerialFree(line: { id: string }, inventoryItemId: string, serialNumber: string): Promise<void> {
    const isOnLine = await this.exists(
      and(
        eq(goodsReceiptLineItems.goodsReceiptLineId, line.id),
        eq(goodsReceiptLineItems.serialNumber, serialNumber),
      ) as SQL,
    );
    const [inInventory] = await this.db
      .select({ id: inventoryItemSerials.id })
      .from(inventoryItemSerials)
      .where(
        and(
          eq(inventoryItemSerials.inventoryItemId, inventoryItemId),
          eq(inventoryItemSerials.serialNumber, serialNumber),
        ),
      )
      .limit(1);
    if (!isOnLine && !inInventory) return;
    throw new ConflictException({
      label: 'Duplicate Serial',
      detail: isOnLine
        ? `Serial "${serialNumber}" is already on this line.`
        : `Serial "${serialNumber}" already exists in inventory.`,
      errors: [{ field: 'serialNumber', message: isOnLine ? 'Already on this line' : 'Already in inventory' }],
    });
  }
}
