import { Module } from '@nestjs/common';
import { SupplierEnrollmentsDomainRepository } from './repositories/supplier-enrollments.repository';
import { SupplierEnrollmentsDomainService } from './services/supplier-enrollments.service';

@Module({
  providers: [SupplierEnrollmentsDomainService, SupplierEnrollmentsDomainRepository],
  exports: [SupplierEnrollmentsDomainService, SupplierEnrollmentsDomainRepository],
})
export class SupplierEnrollmentsDomainModule {}
