import { Module } from '@nestjs/common';
import { SiteSuppliersDomainRepository } from './repositories/site-suppliers.repository';
import { SupplierEnrollmentsDomainRepository } from './repositories/supplier-enrollments.repository';
import { SupplierEnrollmentsDomainService } from './services/supplier-enrollments.service';

@Module({
  providers: [SupplierEnrollmentsDomainService, SupplierEnrollmentsDomainRepository, SiteSuppliersDomainRepository],
  exports: [SupplierEnrollmentsDomainService, SupplierEnrollmentsDomainRepository, SiteSuppliersDomainRepository],
})
export class SupplierEnrollmentsDomainModule {}
