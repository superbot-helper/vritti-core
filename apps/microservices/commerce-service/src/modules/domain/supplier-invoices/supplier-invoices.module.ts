import { Module } from '@nestjs/common';
import { SupplierInvoiceCostingDomainRepository } from './repositories/supplier-invoice-costing.repository';
import { SupplierInvoiceLineReceiptsDomainRepository } from './repositories/supplier-invoice-line-receipts.repository';
import { SupplierInvoiceLinesDomainRepository } from './repositories/supplier-invoice-lines.repository';
import { SupplierInvoicesDomainRepository } from './repositories/supplier-invoices.repository';
import { SupplierInvoiceCostingDomainService } from './services/supplier-invoice-costing.service';
import { SupplierInvoiceLinesDomainService } from './services/supplier-invoice-lines.service';
import { SupplierInvoiceMatchDomainService } from './services/supplier-invoice-match.service';
import { SupplierInvoicesDomainService } from './services/supplier-invoices.service';

@Module({
  providers: [
    SupplierInvoicesDomainService,
    SupplierInvoiceLinesDomainService,
    SupplierInvoiceMatchDomainService,
    SupplierInvoiceCostingDomainService,
    SupplierInvoicesDomainRepository,
    SupplierInvoiceLinesDomainRepository,
    SupplierInvoiceLineReceiptsDomainRepository,
    SupplierInvoiceCostingDomainRepository,
  ],
  exports: [SupplierInvoicesDomainService, SupplierInvoiceLinesDomainService],
})
export class SupplierInvoicesDomainModule {}
