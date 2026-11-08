import { Injectable, Logger } from '@nestjs/common';
import Decimal from '@vritti/api-sdk/decimal';
import { type CurrencyCode, majorToMinor } from '@vritti/api-sdk/money';
import type { SuccessResponseDto } from '@vritti/api-sdk/responses';
import type { AddSupplierInvoiceLineDto } from '../dto/request/add-supplier-invoice-line.dto';
import type { UpdateSupplierInvoiceLineDto } from '../dto/request/update-supplier-invoice-line.dto';
import { SupplierInvoiceLinesDomainRepository } from '../repositories/supplier-invoice-lines.repository';
import { SupplierInvoicesDomainRepository } from '../repositories/supplier-invoices.repository';
import { SupplierInvoiceCostingDomainService } from './supplier-invoice-costing.service';
import { SupplierInvoiceMatchDomainService } from './supplier-invoice-match.service';

@Injectable()
export class SupplierInvoiceLinesDomainService {
  private readonly logger = new Logger(SupplierInvoiceLinesDomainService.name);

  constructor(
    private readonly repository: SupplierInvoiceLinesDomainRepository,
    private readonly invoicesRepository: SupplierInvoicesDomainRepository,
    private readonly matchService: SupplierInvoiceMatchDomainService,
    private readonly costingService: SupplierInvoiceCostingDomainService,
  ) {}

  // Adds a billed line for one of the order's lines, links it to the received stock, recomputes the totals and rematches;
  // on a posted invoice the stock is re-costed
  async create(data: AddSupplierInvoiceLineDto, leCurrencyCode: string): Promise<SuccessResponseDto> {
    const { supplierInvoiceId, ...fields } = data;
    const invoice = await this.invoicesRepository.findEditableOrThrow(supplierInvoiceId);
    const orderItem = await this.repository.findPurchaseOrderItemOrThrow(
      invoice.purchaseOrderId,
      fields.purchaseOrderItemId,
    );
    this.repository.assertAmountsInCurrency(
      {
        unitPrice: fields.unitPrice,
        mrp: fields.mrp,
        discountAmount: fields.discountAmount,
        taxAmount: fields.taxAmount,
      },
      invoice.currencyCode,
    );

    // Line total = billed × unit price − discount + tax, all in the invoice's minor units
    const currencyCode = invoice.currencyCode as CurrencyCode;
    const unitPrice = majorToMinor(fields.unitPrice.value, currencyCode, 'unitPrice');
    const discountAmount = fields.discountAmount
      ? majorToMinor(fields.discountAmount.value, currencyCode, 'discountAmount')
      : 0n;
    const taxAmount = fields.taxAmount ? majorToMinor(fields.taxAmount.value, currencyCode, 'taxAmount') : 0n;
    const grossAmount = BigInt(
      new Decimal(unitPrice.toString()).times(fields.billedQty).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toFixed(0),
    );
    this.repository.assertDiscountWithinGross(grossAmount, discountAmount);

    await this.invoicesRepository.transaction(() =>
      this.costingService.withRecosting(invoice, leCurrencyCode, async () => {
        const line = await this.repository.create({
          supplierInvoiceId,
          purchaseOrderItemId: orderItem.id,
          inventoryItemId: orderItem.inventoryItemId,
          uomId: orderItem.uomId,
          lotNumber: fields.lotNumber ?? null,
          expiryDate: fields.expiryDate ?? null,
          mrp: fields.mrp ? majorToMinor(fields.mrp.value, currencyCode, 'mrp') : null,
          billedQty: fields.billedQty,
          freeQty: fields.freeQty,
          unitPrice,
          discountAmount,
          taxAmount,
          lineTotal: grossAmount - discountAmount + taxAmount,
        });
        await this.matchService.linkLine(line);
        await this.invoicesRepository.syncTotals(supplierInvoiceId);
        await this.matchService.rematch(invoice.purchaseOrderId);
      }),
    );
    this.logger.log(`Added ${orderItem.inventoryItemName} to supplier invoice ${invoice.invoiceNumber}`);
    return { success: true, message: `"${orderItem.inventoryItemName}" added to invoice "${invoice.invoiceNumber}".` };
  }

  // Replaces a line's billed fields, relinks it to the received stock, recomputes the totals and rematches; on a posted
  // invoice the stock is re-costed
  async update(data: UpdateSupplierInvoiceLineDto, leCurrencyCode: string): Promise<SuccessResponseDto> {
    const { id, supplierInvoiceId, ...fields } = data;
    const invoice = await this.invoicesRepository.findEditableOrThrow(supplierInvoiceId);
    await this.repository.findByIdOrThrow(supplierInvoiceId, id);
    const orderItem = await this.repository.findPurchaseOrderItemOrThrow(
      invoice.purchaseOrderId,
      fields.purchaseOrderItemId,
    );
    this.repository.assertAmountsInCurrency(
      {
        unitPrice: fields.unitPrice,
        mrp: fields.mrp,
        discountAmount: fields.discountAmount,
        taxAmount: fields.taxAmount,
      },
      invoice.currencyCode,
    );

    // Line total = billed × unit price − discount + tax, all in the invoice's minor units
    const currencyCode = invoice.currencyCode as CurrencyCode;
    const unitPrice = majorToMinor(fields.unitPrice.value, currencyCode, 'unitPrice');
    const discountAmount = fields.discountAmount
      ? majorToMinor(fields.discountAmount.value, currencyCode, 'discountAmount')
      : 0n;
    const taxAmount = fields.taxAmount ? majorToMinor(fields.taxAmount.value, currencyCode, 'taxAmount') : 0n;
    const grossAmount = BigInt(
      new Decimal(unitPrice.toString()).times(fields.billedQty).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toFixed(0),
    );
    this.repository.assertDiscountWithinGross(grossAmount, discountAmount);

    await this.invoicesRepository.transaction(() =>
      this.costingService.withRecosting(invoice, leCurrencyCode, async () => {
        const line = await this.repository.update(id, {
          purchaseOrderItemId: orderItem.id,
          inventoryItemId: orderItem.inventoryItemId,
          uomId: orderItem.uomId,
          lotNumber: fields.lotNumber ?? null,
          expiryDate: fields.expiryDate ?? null,
          mrp: fields.mrp ? majorToMinor(fields.mrp.value, currencyCode, 'mrp') : null,
          billedQty: fields.billedQty,
          freeQty: fields.freeQty,
          unitPrice,
          discountAmount,
          taxAmount,
          lineTotal: grossAmount - discountAmount + taxAmount,
        });
        await this.matchService.linkLine(line);
        await this.invoicesRepository.syncTotals(supplierInvoiceId);
        await this.matchService.rematch(invoice.purchaseOrderId);
      }),
    );
    this.logger.log(`Updated ${orderItem.inventoryItemName} on supplier invoice ${invoice.invoiceNumber}`);
    return {
      success: true,
      message: `"${orderItem.inventoryItemName}" updated on invoice "${invoice.invoiceNumber}".`,
    };
  }

  // Removes a line with its links, recomputes the totals and rematches; on a posted invoice the stock is re-costed
  async delete(supplierInvoiceId: string, id: string, leCurrencyCode: string): Promise<SuccessResponseDto> {
    const invoice = await this.invoicesRepository.findEditableOrThrow(supplierInvoiceId);
    await this.repository.findByIdOrThrow(supplierInvoiceId, id);
    await this.invoicesRepository.transaction(() =>
      this.costingService.withRecosting(invoice, leCurrencyCode, async () => {
        await this.repository.delete(id);
        await this.invoicesRepository.syncTotals(supplierInvoiceId);
        await this.matchService.rematch(invoice.purchaseOrderId);
      }),
    );
    this.logger.log(`Removed line ${id} from supplier invoice ${invoice.invoiceNumber}`);
    return { success: true, message: `Line removed from invoice "${invoice.invoiceNumber}".` };
  }
}
