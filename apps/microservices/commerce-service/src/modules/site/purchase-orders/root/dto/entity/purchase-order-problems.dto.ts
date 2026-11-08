import type { GoodsReceiptItemFlagDto } from '@domain/goods-receipts/dto/entity/goods-receipt-item.dto';
import type { PurchaseOrderReceiptItemFlagsDto } from '@domain/goods-receipts/dto/entity/purchase-order-receipt-item-flags.dto';
import type { PurchaseOrderInvoiceFlagsDto } from '@domain/supplier-invoices/dto/entity/purchase-order-invoice-flags.dto';
import _ from '@vritti/api-sdk/lodash';
import type { GoodsReceiptStatus, SupplierInvoiceLineFlag, SupplierInvoiceStatus } from '@/db/schema';

export const PurchaseOrderProblemSourceValues = {
  GOODS_RECEIPT: 'GOODS_RECEIPT',
  SUPPLIER_INVOICE: 'SUPPLIER_INVOICE',
} as const;

export type PurchaseOrderProblemSource =
  (typeof PurchaseOrderProblemSourceValues)[keyof typeof PurchaseOrderProblemSourceValues];

export class PurchaseOrderProblemDto {
  source: PurchaseOrderProblemSource;
  code: string;
  detail: string;
  documentId: string;
  documentNumber: string;
  documentStatus: GoodsReceiptStatus | SupplierInvoiceStatus;
  lotNumber: string | null;

  // Shapes a flag raised on a goods receipt item
  static fromReceiptFlag(
    item: PurchaseOrderReceiptItemFlagsDto,
    flag: GoodsReceiptItemFlagDto,
  ): PurchaseOrderProblemDto {
    const dto = new PurchaseOrderProblemDto();
    dto.source = PurchaseOrderProblemSourceValues.GOODS_RECEIPT;
    dto.code = flag.code;
    dto.detail = flag.detail;
    dto.documentId = item.goodsReceiptId;
    dto.documentNumber = item.grNumber;
    dto.documentStatus = item.receiptStatus;
    dto.lotNumber = null;
    return dto;
  }

  // Shapes a flag stored on a supplier invoice header or on one of its lines
  static fromInvoiceFlag(
    invoice: PurchaseOrderInvoiceFlagsDto,
    flag: SupplierInvoiceLineFlag,
    lotNumber: string | null,
  ): PurchaseOrderProblemDto {
    const dto = new PurchaseOrderProblemDto();
    dto.source = PurchaseOrderProblemSourceValues.SUPPLIER_INVOICE;
    dto.code = flag.code;
    dto.detail = flag.detail;
    dto.documentId = invoice.id;
    dto.documentNumber = invoice.invoiceNumber;
    dto.documentStatus = invoice.status;
    dto.lotNumber = lotNumber;
    return dto;
  }
}

export class PurchaseOrderLineProblemsDto {
  purchaseOrderItemId: string;
  problems: PurchaseOrderProblemDto[];
}

export class PurchaseOrderProblemsSummaryDto {
  total: number;
  receiving: number;
  invoicing: number;
}

export class PurchaseOrderProblemsDto {
  summary: PurchaseOrderProblemsSummaryDto;
  lines: PurchaseOrderLineProblemsDto[];
  orderProblems: PurchaseOrderProblemDto[];

  // Groups receipt item and invoice line flags by order line, receipts first, and keeps invoice header flags for the order
  static from(
    receiptItems: PurchaseOrderReceiptItemFlagsDto[],
    invoices: PurchaseOrderInvoiceFlagsDto[],
  ): PurchaseOrderProblemsDto {
    const receiptProblems = receiptItems.flatMap((item) =>
      item.flags.map((flag) => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        problem: PurchaseOrderProblemDto.fromReceiptFlag(item, flag),
      })),
    );
    const invoiceLineProblems = invoices.flatMap((invoice) =>
      invoice.lines.flatMap((line) =>
        line.flags.map((flag) => ({
          purchaseOrderItemId: line.purchaseOrderItemId,
          problem: PurchaseOrderProblemDto.fromInvoiceFlag(invoice, flag, line.lotNumber),
        })),
      ),
    );
    const orderProblems = invoices.flatMap((invoice) =>
      invoice.flags.map((flag) => PurchaseOrderProblemDto.fromInvoiceFlag(invoice, flag, null)),
    );
    const problemsByLine = _.groupBy([...receiptProblems, ...invoiceLineProblems], 'purchaseOrderItemId');

    const dto = new PurchaseOrderProblemsDto();
    dto.summary = {
      total: receiptProblems.length + invoiceLineProblems.length + orderProblems.length,
      receiving: receiptProblems.length,
      invoicing: invoiceLineProblems.length + orderProblems.length,
    };
    dto.lines = Object.entries(problemsByLine).map(([purchaseOrderItemId, lineProblems]) => ({
      purchaseOrderItemId,
      problems: lineProblems.map((lineProblem) => lineProblem.problem),
    }));
    dto.orderProblems = orderProblems;
    return dto;
  }
}
