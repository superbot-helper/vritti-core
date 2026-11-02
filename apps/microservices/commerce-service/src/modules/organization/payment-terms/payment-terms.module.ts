import { PaymentTermRulesDomainModule } from '@domain/payment-term-rules/payment-term-rules.module';
import { PaymentTermsDomainModule } from '@domain/payment-terms/payment-terms.module';
import { Module } from '@nestjs/common';
import { PaymentTermsRootController } from './root/payment-terms-root.controller';
import { PaymentTermsRulesController } from './rules/payment-terms-rules.controller';
import { PaymentTermsRulesService } from './rules/services/payment-terms-rules.service';

@Module({
  imports: [PaymentTermsDomainModule, PaymentTermRulesDomainModule],
  controllers: [PaymentTermsRootController, PaymentTermsRulesController],
  providers: [PaymentTermsRulesService],
})
export class OrgPaymentTermsModule {}
