import { ApiProperty } from '@nestjs/swagger';

export const PURCHASE_ORDER_PROBLEM_SOURCES = ['GOODS_RECEIPT', 'SUPPLIER_INVOICE'] as const;
export type PurchaseOrderProblemSource = (typeof PURCHASE_ORDER_PROBLEM_SOURCES)[number];

export const PURCHASE_ORDER_PROBLEM_DOCUMENT_STATUSES = ['DRAFT', 'PUBLISHED', 'POSTED'] as const;
export type PurchaseOrderProblemDocumentStatus = (typeof PURCHASE_ORDER_PROBLEM_DOCUMENT_STATUSES)[number];

export class PurchaseOrderProblemResponseDto {
  @ApiProperty({ description: 'Kind of document that raised the problem', enum: PURCHASE_ORDER_PROBLEM_SOURCES })
  source: PurchaseOrderProblemSource;

  @ApiProperty({
    description:
      'Flag code — OVER_RECEIVED, SHORT_EXPIRY or REJECTED on a goods receipt; a supplier invoice line or header match check on an invoice',
    example: 'OVER_RECEIVED',
  })
  code: string;

  @ApiProperty({ description: 'What the flag found, in words', example: '2 strips rejected on receipt.' })
  detail: string;

  @ApiProperty({ description: 'ID of the goods receipt or supplier invoice that raised it', format: 'uuid' })
  documentId: string;

  @ApiProperty({ description: 'GR number or invoice number of that document', example: 'GR-202611-0004' })
  documentNumber: string;

  @ApiProperty({
    description: 'Status of that document — DRAFT or PUBLISHED for a receipt, DRAFT or POSTED for an invoice',
    enum: PURCHASE_ORDER_PROBLEM_DOCUMENT_STATUSES,
  })
  documentStatus: PurchaseOrderProblemDocumentStatus;

  @ApiProperty({ description: 'Batch the invoice line bills, when it names one', type: String, nullable: true })
  lotNumber: string | null;
}

export class PurchaseOrderLineProblemsResponseDto {
  @ApiProperty({ description: 'ID of the purchase order line', format: 'uuid' })
  purchaseOrderItemId: string;

  @ApiProperty({
    type: [PurchaseOrderProblemResponseDto],
    description: 'Problems on the line — receipts first, then invoices, each newest document first',
  })
  problems: PurchaseOrderProblemResponseDto[];
}

export class PurchaseOrderProblemsSummaryResponseDto {
  @ApiProperty({ description: 'Every problem on the order' })
  total: number;

  @ApiProperty({ description: 'Problems raised on goods receipts' })
  receiving: number;

  @ApiProperty({ description: 'Problems raised on supplier invoices, lines and headers' })
  invoicing: number;
}

export class PurchaseOrderProblemsResponseDto {
  @ApiProperty({ type: PurchaseOrderProblemsSummaryResponseDto, description: 'Problem counts by where they arose' })
  summary: PurchaseOrderProblemsSummaryResponseDto;

  @ApiProperty({
    type: [PurchaseOrderLineProblemsResponseDto],
    description: 'Order lines with at least one problem',
  })
  lines: PurchaseOrderLineProblemsResponseDto[];

  @ApiProperty({
    type: [PurchaseOrderProblemResponseDto],
    description: 'Problems not tied to a line, such as an invoice rate that differs from the order',
  })
  orderProblems: PurchaseOrderProblemResponseDto[];
}
