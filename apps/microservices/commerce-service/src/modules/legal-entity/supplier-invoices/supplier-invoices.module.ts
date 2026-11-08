import { SupplierInvoicesDomainModule } from '@domain/supplier-invoices/supplier-invoices.module';
import { Module } from '@nestjs/common';
import { LeSupplierInvoiceLinesController } from './lines/supplier-invoice-lines.controller';
import { LeSupplierInvoicesRootController } from './root/supplier-invoices-root.controller';

@Module({
  imports: [SupplierInvoicesDomainModule],
  controllers: [LeSupplierInvoicesRootController, LeSupplierInvoiceLinesController],
})
export class LeSupplierInvoicesModule {}
