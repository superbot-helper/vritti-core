import { Module } from '@nestjs/common';
import { GoodsReceiptLotsDomainRepository } from './repositories/goods-receipt-lots.repository';
import { GoodsReceiptLotsDomainService } from './services/goods-receipt-lots.service';

@Module({
  providers: [GoodsReceiptLotsDomainService, GoodsReceiptLotsDomainRepository],
  exports: [GoodsReceiptLotsDomainService, GoodsReceiptLotsDomainRepository],
})
export class GoodsReceiptLotsDomainModule {}
