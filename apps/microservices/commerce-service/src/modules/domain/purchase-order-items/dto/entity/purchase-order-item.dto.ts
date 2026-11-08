import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import type { PurchaseOrderItemRow } from '../../repositories/purchase-order-items.repository';

export class PurchaseOrderItemDto {
  id: string;
  purchaseOrderId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  uomId: string;
  orderUomSymbol: string | null;
  uomQty: number;
  expectedFreeQty: number;
  receivedQty: number;
  primaryUomQty: number;
  primaryUomSymbol: string | null;
  currencyCode: string;
  unitPrice: CurrencyAmountDto;
  primaryUomUnitPrice: CurrencyAmountDto;
  totalPrice: CurrencyAmountDto;
  sourceUnitPrice: CurrencyAmountDto | null;
  schemeBuyQty: number | null;
  schemeFreeQty: number | null;
  hasScheme: boolean;

  static from(row: PurchaseOrderItemRow): PurchaseOrderItemDto {
    const dto = new PurchaseOrderItemDto();
    dto.id = row.id;
    dto.purchaseOrderId = row.purchaseOrderId;
    dto.inventoryItemId = row.inventoryItemId;
    dto.inventoryItemName = row.inventoryItemName ?? '';
    dto.uomId = row.uomId;
    dto.orderUomSymbol = row.orderUomSymbol;
    dto.uomQty = row.uomQty;
    dto.expectedFreeQty = row.freeQty;
    dto.receivedQty = row.receivedQuantity;
    dto.primaryUomQty = row.primaryUomQty;
    dto.primaryUomSymbol = row.primaryUomSymbol;
    dto.currencyCode = row.currencyCode;
    dto.unitPrice = CurrencyAmountDto.from(row.unitPrice, row.currencyCode);
    dto.primaryUomUnitPrice = CurrencyAmountDto.from(row.primaryUomUnitPrice, row.currencyCode);
    dto.totalPrice = CurrencyAmountDto.from(row.totalPrice, row.currencyCode);
    dto.sourceUnitPrice =
      row.sourceCurrencyCode && row.sourceUnitPrice !== null
        ? CurrencyAmountDto.from(row.sourceUnitPrice, row.sourceCurrencyCode)
        : null;
    dto.schemeBuyQty = row.schemeBuyQty;
    dto.schemeFreeQty = row.schemeFreeQty;
    dto.hasScheme = row.hasScheme;
    return dto;
  }
}
