import { Module } from '@nestjs/common';
import { PaymentTermRulesDomainRepository } from './repositories/payment-term-rules.repository';
import { PaymentTermRulesDomainService } from './services/payment-term-rules.service';

@Module({
  providers: [PaymentTermRulesDomainService, PaymentTermRulesDomainRepository],
  exports: [PaymentTermRulesDomainService, PaymentTermRulesDomainRepository],
})
export class PaymentTermRulesDomainModule {}
