import { Module } from '@nestjs/common';
import { ItemSupplierPriceComparisonsRepository } from './repositories/item-supplier-price-comparisons.repository';
import { SupplierItemPricesDomainRepository } from './repositories/supplier-item-prices.repository';
import { SupplierItemPricesDomainService } from './services/supplier-item-prices.service';

@Module({
  providers: [
    SupplierItemPricesDomainService,
    SupplierItemPricesDomainRepository,
    ItemSupplierPriceComparisonsRepository,
  ],
  exports: [SupplierItemPricesDomainService, SupplierItemPricesDomainRepository],
})
export class SupplierItemPricesDomainModule {}
