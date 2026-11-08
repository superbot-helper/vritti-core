import { Module } from '@nestjs/common';
import { TaxClassGroupsDomainRepository } from './repositories/tax-class-groups.repository';
import { TaxClassMappingsDomainRepository } from './repositories/tax-class-mappings.repository';
import { TaxGroupRatesDomainRepository } from './repositories/tax-group-rates.repository';
import { TaxGroupsDomainRepository } from './repositories/tax-groups.repository';
import { TaxClassGroupsDomainService } from './services/tax-class-groups.service';
import { TaxGroupRatesDomainService } from './services/tax-group-rates.service';
import { TaxGroupsDomainService } from './services/tax-groups.service';

@Module({
  providers: [
    TaxGroupsDomainRepository,
    TaxGroupRatesDomainRepository,
    TaxClassGroupsDomainRepository,
    TaxClassMappingsDomainRepository,
    TaxGroupsDomainService,
    TaxGroupRatesDomainService,
    TaxClassGroupsDomainService,
  ],
  exports: [TaxGroupsDomainService, TaxGroupRatesDomainService, TaxClassGroupsDomainService],
})
export class TaxGroupsDomainModule {}
