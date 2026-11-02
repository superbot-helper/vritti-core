import { SupplierItemPricesDomainModule } from '@domain/supplier-item-prices/supplier-item-prices.module';
import { SupplierItemsDomainModule } from '@domain/supplier-items/supplier-items.module';
import { SupplierQuotationsDomainModule } from '@domain/supplier-quotations/supplier-quotations.module';
import { SupplierSitesDomainModule } from '@domain/supplier-sites/supplier-sites.module';
import { Module } from '@nestjs/common';
import { SiteSupplierItemPricesController } from './items/prices/site-supplier-item-prices.controller';
import { SiteSupplierItemsController } from './items/root/site-supplier-items.controller';
import { SiteSupplierQuotationsController } from './quotations/site-supplier-quotations.controller';
import { SiteSuppliersService } from './root/services/site-suppliers.service';
import { SiteSuppliersController } from './root/site-suppliers.controller';

@Module({
  imports: [
    SupplierSitesDomainModule,
    SupplierItemsDomainModule,
    SupplierItemPricesDomainModule,
    SupplierQuotationsDomainModule,
  ],
  controllers: [
    SiteSuppliersController,
    SiteSupplierItemsController,
    SiteSupplierItemPricesController,
    SiteSupplierQuotationsController,
  ],
  providers: [SiteSuppliersService],
})
export class SiteSuppliersModule {}
