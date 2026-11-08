import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import type { GoodsReceiptLotRow } from '../../repositories/goods-receipt-lots.repository';

export class GoodsReceiptLotDto {
  id: string;
  goodsReceiptItemId: string;
  lotNumber: string;
  manufacturingDate: string | null;
  expiryDate: string;
  resolvedLotId: string | null;
  mrp: CurrencyAmountDto | null;
  linesCount: number;
  totalQuantity: number;
  createdAt: string;

  static from(row: GoodsReceiptLotRow, leCurrencyCode: string): GoodsReceiptLotDto {
    const dto = new GoodsReceiptLotDto();
    dto.id = row.id;
    dto.goodsReceiptItemId = row.goodsReceiptItemId;
    dto.lotNumber = row.lotNumber;
    dto.manufacturingDate = row.manufacturingDate;
    dto.expiryDate = row.expiryDate;
    dto.resolvedLotId = row.resolvedLotId;
    dto.mrp = row.mrp === null ? null : CurrencyAmountDto.from(row.mrp, leCurrencyCode);
    dto.linesCount = row.linesCount;
    dto.totalQuantity = row.totalQuantity;
    dto.createdAt = row.createdAt.toISOString();
    return dto;
  }
}
