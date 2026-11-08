import { SITE_GOODS_RECEIPTS } from '@vritti/commerce-permissions/goods-receipts';
import { SITE_PURCHASE_ORDERS } from '@vritti/commerce-permissions/purchase-orders';
import type { PurchaseOrdersBinding } from '@/components/purchase-orders/bindings';
import { useCreateGoodsReceipt } from '@/hooks/site/goods-receipts';
import {
  PURCHASE_ORDER_GOODS_RECEIPTS_TABLE_KEY,
  PURCHASE_ORDER_ITEMS_TABLE_KEY,
  PURCHASE_ORDERS_TABLE_KEY,
  useAddPurchaseOrderItem,
  useChangePurchaseOrderExchangeRate,
  useChangePurchaseOrderSupplier,
  useClosePurchaseOrder,
  useCreatePurchaseOrder,
  useDeletePurchaseOrder,
  useDownloadPurchaseOrderPdf,
  usePurchaseOrder,
  usePurchaseOrderGoodsReceiptsTable,
  usePurchaseOrderItemIds,
  usePurchaseOrderItemsTable,
  usePurchaseOrderProblems,
  usePurchaseOrdersTable,
  useRemovePurchaseOrderItem,
  useSendPurchaseOrderEmail,
  useSetPurchaseOrderConversionRate,
  useUpdatePurchaseOrderItem,
  useUpdatePurchaseOrderNotes,
  useUpdatePurchaseOrderStatus,
} from '@/hooks/site/purchase-orders';
import { SiteSupplierFilter } from '@/selectors/site-supplier';
import { EnrolledSupplierSelector } from './EnrolledSupplierSelector';
import { InvoicesTab } from './invoices/InvoicesTab';
import { invoicesBinding } from './invoicesBinding';

// The session site's purchase orders; the site also enters the supplier's invoices from each order
export const binding: PurchaseOrdersBinding = {
  permissions: SITE_PURCHASE_ORDERS,
  spansSites: false,
  suppliers: { Selector: EnrolledSupplierSelector, Filter: SiteSupplierFilter },
  goodsReceipts: { addPermission: SITE_GOODS_RECEIPTS.add, useCreate: useCreateGoodsReceipt },
  invoices: {
    permission: SITE_PURCHASE_ORDERS.invoices.view,
    Tab: InvoicesTab,
    invoicePath: invoicesBinding.invoicePath,
  },

  tableKey: PURCHASE_ORDERS_TABLE_KEY,
  tableSlug: 'commerce-site-purchase-orders',
  itemsTableKey: PURCHASE_ORDER_ITEMS_TABLE_KEY,
  itemsTableSlug: (id) => `commerce-purchase-order-${id}-items`,
  goodsReceiptsTableKey: PURCHASE_ORDER_GOODS_RECEIPTS_TABLE_KEY,
  goodsReceiptsTableSlug: (id) => `commerce-purchase-order-${id}-goods-receipts`,

  useTable: usePurchaseOrdersTable,
  usePurchaseOrder,
  useItemIds: usePurchaseOrderItemIds,
  useItemsTable: usePurchaseOrderItemsTable,
  useGoodsReceiptsTable: usePurchaseOrderGoodsReceiptsTable,
  useProblems: usePurchaseOrderProblems,

  useCreate: useCreatePurchaseOrder,
  useAddItem: useAddPurchaseOrderItem,
  useUpdateItem: useUpdatePurchaseOrderItem,
  useRemoveItem: useRemovePurchaseOrderItem,
  useUpdateNotes: useUpdatePurchaseOrderNotes,
  useChangeSupplier: useChangePurchaseOrderSupplier,
  useChangeExchangeRate: useChangePurchaseOrderExchangeRate,
  useSetConversionRate: useSetPurchaseOrderConversionRate,
  useUpdateStatus: useUpdatePurchaseOrderStatus,
  useSendEmail: useSendPurchaseOrderEmail,
  useClose: useClosePurchaseOrder,
  useDelete: useDeletePurchaseOrder,
  useDownloadPdf: useDownloadPurchaseOrderPdf,
};
