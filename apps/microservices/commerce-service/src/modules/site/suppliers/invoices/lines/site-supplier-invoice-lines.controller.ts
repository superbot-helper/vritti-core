import { AddSupplierInvoiceLineDto } from '@domain/supplier-invoices/dto/request/add-supplier-invoice-line.dto';
import { UpdateSupplierInvoiceLineDto } from '@domain/supplier-invoices/dto/request/update-supplier-invoice-line.dto';
import { SupplierInvoiceLinesDomainService } from '@domain/supplier-invoices/services/supplier-invoice-lines.service';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcSiteCurrencyCode } from '@vritti/api-sdk/nats';
import type { SuccessResponseDto } from '@vritti/api-sdk/responses';

@Controller()
export class SiteSupplierInvoiceLinesController {
  private readonly logger = new Logger(SiteSupplierInvoiceLinesController.name);

  constructor(private readonly service: SupplierInvoiceLinesDomainService) {}

  // Adds a billed line to an invoice
  @MessagePattern({ cmd: 'site.suppliers.invoices.lines.create' })
  create(
    @Payload() dto: AddSupplierInvoiceLineDto,
    @RpcSiteCurrencyCode() siteCurrencyCode: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`site.suppliers.invoices.lines.create — invoiceId: ${dto.supplierInvoiceId}`);
    return this.service.create(dto, siteCurrencyCode);
  }

  // Updates a line of an invoice
  @MessagePattern({ cmd: 'site.suppliers.invoices.lines.update' })
  update(
    @Payload() dto: UpdateSupplierInvoiceLineDto,
    @RpcSiteCurrencyCode() siteCurrencyCode: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`site.suppliers.invoices.lines.update — id: ${dto.id}`);
    return this.service.update(dto, siteCurrencyCode);
  }

  // Removes a line from an invoice
  @MessagePattern({ cmd: 'site.suppliers.invoices.lines.delete' })
  delete(
    @Payload() data: { supplierInvoiceId: string; id: string },
    @RpcSiteCurrencyCode() siteCurrencyCode: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`site.suppliers.invoices.lines.delete — id: ${data.id}`);
    return this.service.delete(data.supplierInvoiceId, data.id, siteCurrencyCode);
  }
}
