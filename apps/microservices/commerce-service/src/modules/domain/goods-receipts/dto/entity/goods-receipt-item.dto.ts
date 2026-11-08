import Decimal from '@vritti/api-sdk/decimal';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import { pluralize } from '@vritti/api-sdk/pluralize';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { InventoryTracking } from '@/db/schema';
import type { GoodsReceiptItemRow } from '../../repositories/goods-receipt-items.repository';
import { MIN_SHELF_LIFE_DAYS } from '../../services/goods-receipts.service';

export const GoodsReceiptItemFlagCodeValues = {
  OVER_RECEIVED: 'OVER_RECEIVED',
  SHORT_EXPIRY: 'SHORT_EXPIRY',
  REJECTED: 'REJECTED',
} as const;

export type GoodsReceiptItemFlagCode =
  (typeof GoodsReceiptItemFlagCodeValues)[keyof typeof GoodsReceiptItemFlagCodeValues];

export class GoodsReceiptItemFlagDto {
  code: GoodsReceiptItemFlagCode;
  detail: string;
}

export class GoodsReceiptItemDto {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  inventoryItemTracking: InventoryTracking;
  uomId: string;
  uomSymbol: string;
  uomAllowDecimal: boolean;
  primaryUomSymbol: string | null;
  receivedQty: number;
  rejectedQuantity: number;
  acceptedQty: number;
  distributedQty: number;
  orderedQty: number;
  expectedFreeQty: number;
  alreadyReceivedQty: number;
  poUnitPrice: CurrencyAmountDto;
  lotsCount: number;
  linesCount: number;
  unbalancedLinesCount: number;
  flags: GoodsReceiptItemFlagDto[];
  createdAt: string;

  // Shapes an item and flags over-receipt, short shelf life and rejected goods — flags never block the receipt
  static from(row: GoodsReceiptItemRow): GoodsReceiptItemDto {
    const acceptedQty = new Decimal(row.receivedQty).minus(row.rejectedQuantity);
    const receivedInAll = acceptedQty.plus(row.alreadyReceivedQty);
    const expectedInAll = new Decimal(row.orderedQty).plus(row.expectedFreeQty);
    const uomSymbol = row.uomSymbol ?? '';

    const flags: GoodsReceiptItemFlagDto[] = [];
    if (receivedInAll.gt(expectedInAll)) {
      flags.push({
        code: GoodsReceiptItemFlagCodeValues.OVER_RECEIVED,
        detail: `${receivedInAll.toString()} ${uomSymbol} received in all against ${expectedInAll.toString()} expected (${row.orderedQty} ordered + ${row.expectedFreeQty} free).`,
      });
    }
    if (row.earliestExpiryDate !== null) {
      const shelfLifeDays = differenceInCalendarDays(parseISO(row.earliestExpiryDate), parseISO(row.receivedDate));
      if (shelfLifeDays < MIN_SHELF_LIFE_DAYS) {
        flags.push({
          code: GoodsReceiptItemFlagCodeValues.SHORT_EXPIRY,
          detail: `Lot ${row.earliestExpiryLotNumber} had ${pluralize('day', shelfLifeDays, true)} of shelf life left on receipt; ${MIN_SHELF_LIFE_DAYS} are expected.`,
        });
      }
    }
    if (row.rejectedQuantity > 0) {
      flags.push({
        code: GoodsReceiptItemFlagCodeValues.REJECTED,
        detail: `${row.rejectedQuantity} ${uomSymbol} rejected on receipt.`,
      });
    }

    const dto = new GoodsReceiptItemDto();
    dto.id = row.id;
    dto.goodsReceiptId = row.goodsReceiptId;
    dto.purchaseOrderItemId = row.purchaseOrderItemId;
    dto.inventoryItemId = row.inventoryItemId;
    dto.inventoryItemName = row.inventoryItemName ?? '';
    dto.inventoryItemTracking = row.inventoryItemTracking;
    dto.uomId = row.uomId;
    dto.uomSymbol = uomSymbol;
    dto.uomAllowDecimal = row.uomAllowDecimal;
    dto.primaryUomSymbol = row.primaryUomSymbol;
    dto.receivedQty = row.receivedQty;
    dto.rejectedQuantity = row.rejectedQuantity;
    dto.acceptedQty = acceptedQty.toNumber();
    dto.distributedQty = row.distributedQty;
    dto.orderedQty = row.orderedQty;
    dto.expectedFreeQty = row.expectedFreeQty;
    dto.alreadyReceivedQty = row.alreadyReceivedQty;
    dto.poUnitPrice = CurrencyAmountDto.from(row.poUnitPrice, row.poCurrencyCode);
    dto.lotsCount = row.lotsCount;
    dto.linesCount = row.linesCount;
    dto.unbalancedLinesCount = row.unbalancedLinesCount;
    dto.flags = flags;
    dto.createdAt = row.createdAt.toISOString();
    return dto;
  }
}
