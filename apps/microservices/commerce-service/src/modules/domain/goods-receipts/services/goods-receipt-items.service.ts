import { Injectable, Logger } from '@nestjs/common';
import { type FieldMap, FilterProcessor, type TableViewState } from '@vritti/api-sdk/data-table';
import Decimal from '@vritti/api-sdk/decimal';
import { and, asc } from '@vritti/api-sdk/drizzle-orm';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { convertMinor } from '@/common/convert-minor';
import { goodsReceiptItems, inventoryItems, type PurchaseOrderItem } from '@/db/schema';
import { GoodsReceiptItemDto } from '../dto/entity/goods-receipt-item.dto';
import { GoodsReceiptItemsCostDto } from '../dto/entity/goods-receipt-items-cost.dto';
import type { GoodsReceiptTreeNode } from '../dto/entity/goods-receipt-tree.dto';
import { PurchaseOrderReceiptItemFlagsDto } from '../dto/entity/purchase-order-receipt-item-flags.dto';
import type { AddGoodsReceiptItemDto } from '../dto/request/add-goods-receipt-item.dto';
import type { UpdateGoodsReceiptItemDto } from '../dto/request/update-goods-receipt-item.dto';
import {
  type GoodsReceiptItemRow,
  GoodsReceiptItemsDomainRepository,
} from '../repositories/goods-receipt-items.repository';
import { type GoodsReceiptRow, GoodsReceiptsDomainRepository } from '../repositories/goods-receipts.repository';

export type GoodsReceiptPurchaseOrderItem = Pick<
  PurchaseOrderItem,
  'id' | 'purchaseOrderId' | 'inventoryItemId' | 'uomId'
>;

export interface GoodsReceiptItemCost {
  item: GoodsReceiptItemRow;
  acceptedQty: number;
  acceptedPrimaryQty: number;
  unitCost: bigint;
  value: bigint;
}

@Injectable()
export class GoodsReceiptItemsDomainService {
  private readonly logger = new Logger(GoodsReceiptItemsDomainService.name);

  private static readonly SEARCH_FIELD_MAP: FieldMap = {
    inventoryItemName: { column: inventoryItems.name, type: 'string' },
  };
  private static readonly FIELD_MAP: FieldMap = {
    ...GoodsReceiptItemsDomainService.SEARCH_FIELD_MAP,
    receivedQty: { column: goodsReceiptItems.receivedQty, type: 'number' },
    rejectedQuantity: { column: goodsReceiptItems.rejectedQuantity, type: 'number' },
  };

  constructor(
    private readonly receiptsRepository: GoodsReceiptsDomainRepository,
    private readonly itemsRepository: GoodsReceiptItemsDomainRepository,
  ) {}

  // Returns one page of a receipt's items with their purchase order context and flags
  async findForTable(
    goodsReceiptId: string,
    state: TableViewState,
  ): Promise<{ result: GoodsReceiptItemDto[]; count: number }> {
    const orderBy = FilterProcessor.buildOrderBy(state.sort, GoodsReceiptItemsDomainService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination;

    const { result, count } = await this.itemsRepository.findForTable(goodsReceiptId, {
      where: and(
        FilterProcessor.buildWhere(state.filters, GoodsReceiptItemsDomainService.FIELD_MAP),
        FilterProcessor.buildSearch(state.search, GoodsReceiptItemsDomainService.SEARCH_FIELD_MAP),
      ),
      orderBy: orderBy.length > 0 ? orderBy : [asc(goodsReceiptItems.createdAt)],
      limit,
      offset,
    });
    return { result: result.map(GoodsReceiptItemDto.from), count };
  }

  // Returns one item of a receipt with its purchase order context and flags
  async findById(goodsReceiptId: string, itemId: string): Promise<GoodsReceiptItemDto> {
    return GoodsReceiptItemDto.from(await this.itemsRepository.findOnReceiptOrThrow(goodsReceiptId, itemId));
  }

  // Returns the flagged items of a purchase order's receipts, newest receipt first, each with its receipt and flags
  async findFlaggedForPurchaseOrder(purchaseOrderId: string): Promise<PurchaseOrderReceiptItemFlagsDto[]> {
    const items = await this.itemsRepository.findByPurchaseOrderId(purchaseOrderId);
    return items.map(PurchaseOrderReceiptItemFlagsDto.from).filter((item) => item.flags.length > 0);
  }

  // Returns the inventory items counted on a receipt
  findInventoryItemIds(goodsReceiptId: string): Promise<string[]> {
    return this.itemsRepository.findInventoryItemIds(goodsReceiptId);
  }

  // Returns the receipt's items with their lots and lines as a tree
  findTree(goodsReceiptId: string): Promise<GoodsReceiptTreeNode[]> {
    return this.itemsRepository.findTreeByReceiptId(goodsReceiptId);
  }

  // Values each item from its PO line: the LE-currency line total over its ordered plus expected free primary units
  async findProvisionalCosts(goodsReceiptId: string, leCurrencyCode: string): Promise<GoodsReceiptItemCost[]> {
    const items = await this.itemsRepository.findByReceiptId(goodsReceiptId);
    return items.map((item) => {
      const lineTotal = new Decimal(
        convertMinor(item.poTotalPrice, item.poCurrencyCode, leCurrencyCode, item.poExchangeRate).toString(),
      );
      const primaryPerOrderUnit = new Decimal(item.poPrimaryUomQty).dividedBy(item.orderedQty);
      const expectedPrimaryQty = new Decimal(item.poPrimaryUomQty).plus(
        new Decimal(item.expectedFreeQty).times(primaryPerOrderUnit),
      );
      const acceptedQty = new Decimal(item.receivedQty).minus(item.rejectedQuantity);
      const acceptedPrimaryQty = acceptedQty.times(primaryPerOrderUnit);
      return {
        item,
        acceptedQty: acceptedQty.toNumber(),
        acceptedPrimaryQty: acceptedPrimaryQty.toNumber(),
        unitCost: BigInt(lineTotal.dividedBy(expectedPrimaryQty).toFixed(0, Decimal.ROUND_HALF_UP)),
        value: BigInt(
          lineTotal.times(acceptedPrimaryQty).dividedBy(expectedPrimaryQty).toFixed(0, Decimal.ROUND_HALF_UP),
        ),
      };
    });
  }

  // Returns the provisional cost of every item on the receipt, read-only until a supplier invoice sets the final one
  async findItemsCost(goodsReceiptId: string, leCurrencyCode: string): Promise<GoodsReceiptItemsCostDto> {
    return GoodsReceiptItemsCostDto.from(
      await this.findProvisionalCosts(goodsReceiptId, leCurrencyCode),
      leCurrencyCode,
    );
  }

  // Counts a purchase order line on a draft receipt; its item and unit are the line's
  async addItem(
    receipt: GoodsReceiptRow,
    purchaseOrderItem: GoodsReceiptPurchaseOrderItem,
    dto: AddGoodsReceiptItemDto,
  ): Promise<CreateResponseDto<GoodsReceiptItemDto>> {
    const rejectedQuantity = dto.rejectedQuantity ?? 0;
    this.itemsRepository.assertRejectedWithinReceived(dto.receivedQty, rejectedQuantity);
    await this.itemsRepository.assertPurchaseOrderItemNotOnReceipt(receipt.id, purchaseOrderItem.id);

    const created = await this.itemsRepository.create({
      goodsReceiptId: receipt.id,
      siteId: receipt.siteId,
      purchaseOrderItemId: purchaseOrderItem.id,
      inventoryItemId: purchaseOrderItem.inventoryItemId,
      uomId: purchaseOrderItem.uomId,
      receivedQty: dto.receivedQty,
      rejectedQuantity,
    });

    this.logger.log(`Added PO line ${purchaseOrderItem.id} to goods receipt ${receipt.grNumber}`);
    return {
      success: true,
      message: `Item added to goods receipt "${receipt.grNumber}".`,
      data: await this.findById(receipt.id, created.id),
    };
  }

  // Changes the received or rejected quantity of an item on a draft receipt
  async updateItem(dto: UpdateGoodsReceiptItemDto): Promise<SuccessResponseDto> {
    const receipt = await this.receiptsRepository.findDraftOrThrow(dto.goodsReceiptId, 'Cannot Edit Item');
    const item = await this.itemsRepository.findOnReceiptOrThrow(receipt.id, dto.itemId);
    const receivedQty = dto.receivedQty ?? item.receivedQty;
    const rejectedQuantity = dto.rejectedQuantity ?? item.rejectedQuantity;
    this.itemsRepository.assertRejectedWithinReceived(receivedQty, rejectedQuantity);

    await this.itemsRepository.update(item.id, { receivedQty, rejectedQuantity });
    this.logger.log(`Updated item ${item.id} on goods receipt ${receipt.grNumber}`);
    return { success: true, message: `"${item.inventoryItemName}" updated on goods receipt "${receipt.grNumber}".` };
  }

  // Removes an item, with its lots and lines, from a draft receipt
  async removeItem(goodsReceiptId: string, itemId: string): Promise<SuccessResponseDto> {
    const receipt = await this.receiptsRepository.findDraftOrThrow(goodsReceiptId, 'Cannot Remove Item');
    const item = await this.itemsRepository.findOnReceiptOrThrow(receipt.id, itemId);

    await this.itemsRepository.delete(item.id);
    this.logger.log(`Removed item ${item.id} from goods receipt ${receipt.grNumber}`);
    return { success: true, message: `"${item.inventoryItemName}" removed from goods receipt "${receipt.grNumber}".` };
  }
}
