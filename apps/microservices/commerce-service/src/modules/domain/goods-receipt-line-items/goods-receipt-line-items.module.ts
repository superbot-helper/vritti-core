import { Module } from '@nestjs/common';
import { GoodsReceiptLineItemsDomainRepository } from './repositories/goods-receipt-line-items.repository';
import { GoodsReceiptLineItemsDomainService } from './services/goods-receipt-line-items.service';

@Module({
  providers: [GoodsReceiptLineItemsDomainService, GoodsReceiptLineItemsDomainRepository],
  exports: [GoodsReceiptLineItemsDomainService, GoodsReceiptLineItemsDomainRepository],
})
export class GoodsReceiptLineItemsDomainModule {}
