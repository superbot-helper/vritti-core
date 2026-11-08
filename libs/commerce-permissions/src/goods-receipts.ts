export const LE_GOODS_RECEIPTS = {
  featureCode: 'goods-receipts',
  view: 'le.goods-receipts.view',
  add: 'le.goods-receipts.add',
  edit: 'le.goods-receipts.edit',
  delete: 'le.goods-receipts.delete',
  // Posts the receipt: its stock lands at the site and its purchase order's received quantities move
  publish: 'le.goods-receipts.publish',
} as const;

export const SITE_GOODS_RECEIPTS = {
  featureCode: 'goods-receipts',
  view: 'site.goods-receipts.view',
  add: 'site.goods-receipts.add',
  edit: 'site.goods-receipts.edit',
  delete: 'site.goods-receipts.delete',
  // Posts the receipt: its stock lands at the site and its purchase order's received quantities move
  publish: 'site.goods-receipts.publish',
} as const;
