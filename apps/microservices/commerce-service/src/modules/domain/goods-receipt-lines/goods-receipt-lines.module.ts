import { Module } from '@nestjs/common';
import { GoodsReceiptLinesDomainRepository } from './repositories/goods-receipt-lines.repository';
import { GoodsReceiptLinesDomainService } from './services/goods-receipt-lines.service';

@Module({
  providers: [GoodsReceiptLinesDomainService, GoodsReceiptLinesDomainRepository],
  exports: [GoodsReceiptLinesDomainService, GoodsReceiptLinesDomainRepository],
})
export class GoodsReceiptLinesDomainModule {}
