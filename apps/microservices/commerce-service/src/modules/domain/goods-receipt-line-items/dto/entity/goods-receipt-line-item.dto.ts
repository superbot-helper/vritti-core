import type { GoodsReceiptLineItem } from '@/db/schema';

export class GoodsReceiptLineItemDto {
  id: string;
  goodsReceiptLineId: string;
  serialNumber: string;
  createdAt: string;

  static from(entity: GoodsReceiptLineItem): GoodsReceiptLineItemDto {
    const dto = new GoodsReceiptLineItemDto();
    dto.id = entity.id;
    dto.goodsReceiptLineId = entity.goodsReceiptLineId;
    dto.serialNumber = entity.serialNumber;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
