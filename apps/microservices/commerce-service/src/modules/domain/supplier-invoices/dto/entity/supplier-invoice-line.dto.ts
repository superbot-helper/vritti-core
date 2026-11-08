import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import type { SupplierInvoiceLineFlag } from '@/db/schema';
import type { SupplierInvoiceLineReceiptRow } from '../../repositories/supplier-invoice-line-receipts.repository';
import type { SupplierInvoiceLineRow } from '../../repositories/supplier-invoice-lines.repository';

export class SupplierInvoiceLineReceiptDto {
  goodsReceiptId: string;
  grNumber: string;
  lotNumber: string | null;
  quantity: number;

  static from(row: SupplierInvoiceLineReceiptRow): SupplierInvoiceLineReceiptDto {
    const dto = new SupplierInvoiceLineReceiptDto();
    dto.goodsReceiptId = row.goodsReceiptId;
    dto.grNumber = row.grNumber;
    dto.lotNumber = row.lotNumber;
    dto.quantity = row.quantity;
    return dto;
  }
}

export class SupplierInvoiceLineDto {
  id: string;
  supplierInvoiceId: string;
  purchaseOrderItemId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  uomId: string;
  uomSymbol: string | null;
  lotNumber: string | null;
  expiryDate: string | null;
  mrp: CurrencyAmountDto;
  billedQty: number;
  freeQty: number;
  unitPrice: CurrencyAmountDto;
  discountAmount: CurrencyAmountDto;
  taxAmount: CurrencyAmountDto;
  lineTotal: CurrencyAmountDto;
  varianceAmount: CurrencyAmountDto;
  flags: SupplierInvoiceLineFlag[];
  receipts: SupplierInvoiceLineReceiptDto[];

  static from(
    row: SupplierInvoiceLineRow,
    receipts: SupplierInvoiceLineReceiptRow[],
    currencyCode: string,
    leCurrencyCode: string,
  ): SupplierInvoiceLineDto {
    const dto = new SupplierInvoiceLineDto();
    dto.id = row.id;
    dto.supplierInvoiceId = row.supplierInvoiceId;
    dto.purchaseOrderItemId = row.purchaseOrderItemId;
    dto.inventoryItemId = row.inventoryItemId;
    dto.inventoryItemName = row.inventoryItemName;
    dto.uomId = row.uomId;
    dto.uomSymbol = row.uomSymbol;
    dto.lotNumber = row.lotNumber;
    dto.expiryDate = row.expiryDate;
    dto.mrp = CurrencyAmountDto.from(row.mrp ?? 0n, currencyCode);
    dto.billedQty = row.billedQty;
    dto.freeQty = row.freeQty;
    dto.unitPrice = CurrencyAmountDto.from(row.unitPrice, currencyCode);
    dto.discountAmount = CurrencyAmountDto.from(row.discountAmount, currencyCode);
    dto.taxAmount = CurrencyAmountDto.from(row.taxAmount, currencyCode);
    dto.lineTotal = CurrencyAmountDto.from(row.lineTotal, currencyCode);
    dto.varianceAmount = CurrencyAmountDto.from(row.varianceAmount, leCurrencyCode);
    dto.flags = row.flags;
    dto.receipts = receipts.map(SupplierInvoiceLineReceiptDto.from);
    return dto;
  }
}
