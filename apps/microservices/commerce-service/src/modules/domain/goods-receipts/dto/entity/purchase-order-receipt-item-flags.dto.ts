import type { GoodsReceiptStatus } from '@/db/schema';
import type { PurchaseOrderReceiptItemRow } from '../../repositories/goods-receipt-items.repository';
import { GoodsReceiptItemDto, type GoodsReceiptItemFlagDto } from './goods-receipt-item.dto';

export class PurchaseOrderReceiptItemFlagsDto {
  goodsReceiptId: string;
  grNumber: string;
  receiptStatus: GoodsReceiptStatus;
  purchaseOrderItemId: string;
  flags: GoodsReceiptItemFlagDto[];

  // Shapes a receipt item down to its receipt, its order line and the flags GoodsReceiptItemDto raises on it
  static from(row: PurchaseOrderReceiptItemRow): PurchaseOrderReceiptItemFlagsDto {
    const dto = new PurchaseOrderReceiptItemFlagsDto();
    dto.goodsReceiptId = row.goodsReceiptId;
    dto.grNumber = row.grNumber;
    dto.receiptStatus = row.receiptStatus;
    dto.purchaseOrderItemId = row.purchaseOrderItemId;
    dto.flags = GoodsReceiptItemDto.from(row).flags;
    return dto;
  }
}
