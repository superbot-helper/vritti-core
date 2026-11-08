// Hand type mirroring the GraphQL GoodsReceipt. `status` is a union (the server field is String — the
// enum-precision caveat in native-graphql.md); every receipt has its purchase order. `totalAmount`
// is the major-unit money pair ({ currency, value:string }).
export type GoodsReceiptStatus = 'DRAFT' | 'PUBLISHED';

export interface GoodsReceiptPo {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedBy: string | null;
  totalAmount: { currency: string; value: string };
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  supplierId: string;
  supplierName: string;
  status: GoodsReceiptStatus;
  po: GoodsReceiptPo;
  receivedDate: string;
  notes: string | null;
  publishedAt: string | null;
  createdAt: string;
}

// Single-GR query result shape (detail screen reads it cache-only).
export interface GoodsReceiptQueryData {
  goodsReceipt: GoodsReceipt | null;
}
