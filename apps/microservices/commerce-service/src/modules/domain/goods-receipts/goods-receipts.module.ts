import { Module } from '@nestjs/common';
import { GoodsReceiptItemsDomainRepository } from './repositories/goods-receipt-items.repository';
import { GoodsReceiptsDomainRepository } from './repositories/goods-receipts.repository';
import { GoodsReceiptItemsDomainService } from './services/goods-receipt-items.service';
import { GoodsReceiptsDomainService } from './services/goods-receipts.service';

@Module({
  providers: [
    GoodsReceiptsDomainService,
    GoodsReceiptItemsDomainService,
    GoodsReceiptsDomainRepository,
    GoodsReceiptItemsDomainRepository,
  ],
  exports: [
    GoodsReceiptsDomainService,
    GoodsReceiptItemsDomainService,
    GoodsReceiptsDomainRepository,
    GoodsReceiptItemsDomainRepository,
  ],
})
export class GoodsReceiptsDomainModule {}
