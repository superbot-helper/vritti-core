import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import type { GoodsReceiptStatus } from '@/db/schema';
import type { GoodsReceiptRow } from '../../repositories/goods-receipts.repository';

export class GoodsReceiptPurchaseOrderDto {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedBy: string | null;
  totalAmount: CurrencyAmountDto;
}

export class GoodsReceiptDto {
  id: string;
  grNumber: string;
  legalEntityId: string;
  siteId: string;
  supplierId: string;
  supplierName: string;
  status: GoodsReceiptStatus;
  isPublishable: boolean;
  itemCount: number;
  purchaseOrderId: string;
  po: GoodsReceiptPurchaseOrderDto;
  receivedDate: string;
  notes: string | null;
  publishedAt: string | null;
  createdAt: string;

  static from(row: GoodsReceiptRow): GoodsReceiptDto {
    const dto = new GoodsReceiptDto();
    dto.id = row.id;
    dto.grNumber = row.grNumber;
    dto.legalEntityId = row.legalEntityId;
    dto.siteId = row.siteId;
    dto.supplierId = row.supplierId;
    dto.supplierName = row.supplierName ?? '';
    dto.status = row.status;
    dto.isPublishable = row.isPublishable;
    dto.itemCount = row.itemCount;
    dto.purchaseOrderId = row.purchaseOrderId;
    dto.po = {
      id: row.purchaseOrderId,
      poNumber: row.poNumber,
      orderDate: row.poOrderDate,
      expectedBy: row.poExpectedBy,
      totalAmount: CurrencyAmountDto.from(row.poTotalAmount, row.poCurrencyCode),
    };
    dto.receivedDate = row.receivedDate;
    dto.notes = row.notes;
    dto.publishedAt = row.publishedAt?.toISOString() ?? null;
    dto.createdAt = row.createdAt.toISOString();
    return dto;
  }
}
