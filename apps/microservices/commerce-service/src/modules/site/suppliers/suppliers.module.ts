import { SupplierEnrollmentsDomainModule } from '@domain/supplier-enrollments/supplier-enrollments.module';
import { SupplierItemPricesDomainModule } from '@domain/supplier-item-prices/supplier-item-prices.module';
import { SupplierItemsDomainModule } from '@domain/supplier-items/supplier-items.module';
import { SupplierQuotationsDomainModule } from '@domain/supplier-quotations/supplier-quotations.module';
import { Module } from '@nestjs/common';
import { SiteSupplierQuotationsController } from './quotations/site-supplier-quotations.controller';
import { SiteSuppliersController } from './root/site-suppliers.controller';
import { SiteSupplierSiteItemPricesController } from './site-items/prices/site-supplier-site-item-prices.controller';
import { SiteSupplierSiteItemsController } from './site-items/root/site-supplier-site-items.controller';

@Module({
  imports: [
    SupplierEnrollmentsDomainModule,
    SupplierItemsDomainModule,
    SupplierItemPricesDomainModule,
    SupplierQuotationsDomainModule,
  ],
  controllers: [
    SiteSuppliersController,
    SiteSupplierSiteItemsController,
    SiteSupplierSiteItemPricesController,
    SiteSupplierQuotationsController,
  ],
})
export class SiteSuppliersModule {}
