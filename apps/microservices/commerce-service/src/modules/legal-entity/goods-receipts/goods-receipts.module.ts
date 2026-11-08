import { GoodsReceiptLineItemsDomainModule } from '@domain/goods-receipt-line-items/goods-receipt-line-items.module';
import { GoodsReceiptLinesDomainModule } from '@domain/goods-receipt-lines/goods-receipt-lines.module';
import { GoodsReceiptLotsDomainModule } from '@domain/goods-receipt-lots/goods-receipt-lots.module';
import { GoodsReceiptsDomainModule } from '@domain/goods-receipts/goods-receipts.module';
import { InventoryItemQuantsDomainModule } from '@domain/inventory-item-quants/inventory-item-quants.module';
import { Module } from '@nestjs/common';
import { SiteGoodsReceiptsModule } from '@/modules/site/goods-receipts/goods-receipts.module';
import { LeGoodsReceiptsItemsController } from './items/goods-receipts-items.controller';
import { LeGoodsReceiptsLineItemsController } from './line-items/goods-receipts-line-items.controller';
import { LeGoodsReceiptsLinesController } from './lines/goods-receipts-lines.controller';
import { LeGoodsReceiptsLotsController } from './lots/goods-receipts-lots.controller';
import { LeGoodsReceiptsRootController } from './root/goods-receipts-root.controller';

@Module({
  imports: [
    SiteGoodsReceiptsModule,
    GoodsReceiptsDomainModule,
    GoodsReceiptLotsDomainModule,
    GoodsReceiptLinesDomainModule,
    GoodsReceiptLineItemsDomainModule,
    InventoryItemQuantsDomainModule,
  ],
  controllers: [
    LeGoodsReceiptsRootController,
    LeGoodsReceiptsItemsController,
    LeGoodsReceiptsLotsController,
    LeGoodsReceiptsLinesController,
    LeGoodsReceiptsLineItemsController,
  ],
})
export class LeGoodsReceiptsModule {}
