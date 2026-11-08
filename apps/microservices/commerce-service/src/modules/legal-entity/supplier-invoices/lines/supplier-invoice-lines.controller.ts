import { LeAddSupplierInvoiceLineDto } from '@domain/supplier-invoices/dto/request/le-add-supplier-invoice-line.dto';
import { LeUpdateSupplierInvoiceLineDto } from '@domain/supplier-invoices/dto/request/le-update-supplier-invoice-line.dto';
import { SupplierInvoiceLinesDomainService } from '@domain/supplier-invoices/services/supplier-invoice-lines.service';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { SuccessResponseDto } from '@vritti/api-sdk/responses';

@Controller()
export class LeSupplierInvoiceLinesController {
  private readonly logger = new Logger(LeSupplierInvoiceLinesController.name);

  constructor(private readonly service: SupplierInvoiceLinesDomainService) {}

  // Adds a billed line to an invoice
  @MessagePattern({ cmd: 'le.supplierInvoices.lines.create' })
  create(@Payload() dto: LeAddSupplierInvoiceLineDto): Promise<SuccessResponseDto> {
    const { leCurrencyCode, ...line } = dto;
    this.logger.log(`le.supplierInvoices.lines.create — invoiceId: ${line.supplierInvoiceId}`);
    return this.service.create(line, leCurrencyCode);
  }

  // Updates a line of an invoice
  @MessagePattern({ cmd: 'le.supplierInvoices.lines.update' })
  update(@Payload() dto: LeUpdateSupplierInvoiceLineDto): Promise<SuccessResponseDto> {
    const { leCurrencyCode, ...line } = dto;
    this.logger.log(`le.supplierInvoices.lines.update — id: ${line.id}`);
    return this.service.update(line, leCurrencyCode);
  }

  // Removes a line from an invoice
  @MessagePattern({ cmd: 'le.supplierInvoices.lines.delete' })
  delete(
    @Payload() data: { supplierInvoiceId: string; id: string; leCurrencyCode: string },
  ): Promise<SuccessResponseDto> {
    this.logger.log(`le.supplierInvoices.lines.delete — id: ${data.id}`);
    return this.service.delete(data.supplierInvoiceId, data.id, data.leCurrencyCode);
  }
}
