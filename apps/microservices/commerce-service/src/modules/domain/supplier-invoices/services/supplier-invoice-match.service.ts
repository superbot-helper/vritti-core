import { Injectable } from '@nestjs/common';
import Decimal from '@vritti/api-sdk/decimal';
import _ from '@vritti/api-sdk/lodash';
import { type CurrencyCode, minorToMajor } from '@vritti/api-sdk/money';
import { pluralize } from '@vritti/api-sdk/pluralize';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { computeFreeQty } from '@/common/free-qty';
import type { NewSupplierInvoiceLineReceipt, SupplierInvoiceLine, SupplierInvoiceLineFlag } from '@/db/schema';
import { SupplierInvoiceLineReceiptsDomainRepository } from '../repositories/supplier-invoice-line-receipts.repository';
import { SupplierInvoiceLinesDomainRepository } from '../repositories/supplier-invoice-lines.repository';
import { SupplierInvoicesDomainRepository } from '../repositories/supplier-invoices.repository';

export const MIN_SHELF_LIFE_DAYS = 180;

export const SupplierInvoiceFlagCodeValues = {
  BATCH_NOT_RECEIVED: 'BATCH_NOT_RECEIVED',
  EXPIRY_DIFFERS: 'EXPIRY_DIFFERS',
  MRP_DIFFERS: 'MRP_DIFFERS',
  BILLED_MORE_THAN_RECEIVED: 'BILLED_MORE_THAN_RECEIVED',
  BILLED_MORE_THAN_ORDERED: 'BILLED_MORE_THAN_ORDERED',
  PRICE_DIFFERS: 'PRICE_DIFFERS',
  FREE_SHORT: 'FREE_SHORT',
  SHORT_EXPIRY: 'SHORT_EXPIRY',
  RATE_DIFFERS: 'RATE_DIFFERS',
} as const;

export type MatchedLine = Pick<
  SupplierInvoiceLine,
  'id' | 'purchaseOrderItemId' | 'lotNumber' | 'billedQty' | 'freeQty'
>;

@Injectable()
export class SupplierInvoiceMatchDomainService {
  constructor(
    private readonly invoicesRepository: SupplierInvoicesDomainRepository,
    private readonly linesRepository: SupplierInvoiceLinesDomainRepository,
    private readonly receiptsRepository: SupplierInvoiceLineReceiptsDomainRepository,
  ) {}

  // Links a line to the received stock it bills: the published receipt lots of its order line with its batch (or the
  // receipt items when it names no batch), oldest first, each up to what other invoices have not billed yet, until
  // billed + free is covered
  async linkLine(line: MatchedLine): Promise<void> {
    const candidates = line.lotNumber
      ? await this.receiptsRepository.findUnbilledLots(line.id, line.purchaseOrderItemId, line.lotNumber)
      : await this.receiptsRepository.findUnbilledItems(line.id, line.purchaseOrderItemId);

    let quantityToLink = new Decimal(line.billedQty).plus(line.freeQty);
    const receipts: NewSupplierInvoiceLineReceipt[] = [];
    for (const candidate of candidates) {
      const quantity = Decimal.min(quantityToLink, candidate.unbilledQty);
      if (quantity.lte(0)) continue;
      receipts.push({
        supplierInvoiceLineId: line.id,
        goodsReceiptItemId: candidate.goodsReceiptItemId,
        goodsReceiptLotId: candidate.goodsReceiptLotId,
        quantity: quantity.toNumber(),
      });
      quantityToLink = quantityToLink.minus(quantity);
    }
    await this.receiptsRepository.replaceForLine(line.id, receipts);
  }

  // Recomputes the flags of every live invoice of a purchase order, since the billed totals of an order line span all
  // of its invoices; flags never block anything, they are stored on the lines and counted on the header
  async rematch(purchaseOrderId: string): Promise<void> {
    const invoices = await this.invoicesRepository.findLiveForPurchaseOrder(purchaseOrderId);
    const lines = await this.linesRepository.findForMatch(purchaseOrderId);
    const receivedLots = await this.receiptsRepository.findReceivedLots(purchaseOrderId);
    const linesByOrderLine = _.groupBy(lines, 'purchaseOrderItemId');
    const lotsByOrderLine = _.groupBy(receivedLots, 'purchaseOrderItemId');
    const lineFlagCountByInvoice = new Map<string, number>();

    for (const line of lines) {
      const money = (minor: bigint) => `${line.currencyCode} ${minorToMajor(minor, line.currencyCode as CurrencyCode)}`;
      const orderLineInvoiceLines = linesByOrderLine[line.purchaseOrderItemId];
      const billedOnOrderLine = orderLineInvoiceLines.reduce(
        (total, other) => total.plus(other.billedQty),
        new Decimal(0),
      );
      const freeOnOrderLine = orderLineInvoiceLines.reduce((total, other) => total.plus(other.freeQty), new Decimal(0));
      const schemeFreeQty = computeFreeQty(
        billedOnOrderLine.toNumber(),
        line.schemeBuyQty,
        line.schemeFreeQty,
        line.hasScheme,
      );
      const billedAndFree = new Decimal(line.billedQty).plus(line.freeQty);
      const receivedBatch = (lotsByOrderLine[line.purchaseOrderItemId] ?? []).filter(
        (lot) => lot.lotNumber === line.lotNumber,
      );
      const lineExpiryDate = line.expiryDate;
      const lineMrp = line.mrp;
      const otherReceivedExpiry = lineExpiryDate
        ? receivedBatch
            .map((lot) => lot.expiryDate)
            .find((expiryDate) => differenceInCalendarDays(parseISO(lineExpiryDate), parseISO(expiryDate)) !== 0)
        : undefined;
      const otherReceivedMrp = receivedBatch
        .map((lot) => lot.mrp)
        .find((mrp): mrp is bigint => mrp !== null && mrp !== lineMrp);
      const shelfLifeDays = lineExpiryDate
        ? differenceInCalendarDays(parseISO(lineExpiryDate), parseISO(line.invoiceDate))
        : null;

      const batchNotReceived = line.lotNumber !== null && receivedBatch.length === 0;
      const expiryDiffers = lineExpiryDate !== null && otherReceivedExpiry !== undefined;
      const mrpDiffers = lineMrp !== null && otherReceivedMrp !== undefined;
      const billedMoreThanReceived = billedAndFree.gt(line.linkedQty);
      const billedMoreThanOrdered = billedOnOrderLine.gt(line.orderedQty);
      const priceDiffers = line.unitPrice !== line.orderedUnitPrice;
      const freeShort = freeOnOrderLine.lt(schemeFreeQty);
      const shortExpiry = shelfLifeDays !== null && shelfLifeDays < MIN_SHELF_LIFE_DAYS;

      const flags: SupplierInvoiceLineFlag[] = _.compact([
        batchNotReceived && {
          code: SupplierInvoiceFlagCodeValues.BATCH_NOT_RECEIVED,
          detail: `Batch ${line.lotNumber} was not received against this order line.`,
        },
        expiryDiffers && {
          code: SupplierInvoiceFlagCodeValues.EXPIRY_DIFFERS,
          detail: `Received with expiry ${otherReceivedExpiry}, invoice ${lineExpiryDate}.`,
        },
        mrpDiffers && {
          code: SupplierInvoiceFlagCodeValues.MRP_DIFFERS,
          detail: `Received with MRP ${money(otherReceivedMrp)}, invoice ${money(lineMrp)}.`,
        },
        billedMoreThanReceived && {
          code: SupplierInvoiceFlagCodeValues.BILLED_MORE_THAN_RECEIVED,
          detail: `Billed ${line.billedQty} + free ${line.freeQty}, received ${line.linkedQty}.`,
        },
        billedMoreThanOrdered && {
          code: SupplierInvoiceFlagCodeValues.BILLED_MORE_THAN_ORDERED,
          detail: `Billed ${billedOnOrderLine.toString()} across invoices, ordered ${line.orderedQty}.`,
        },
        priceDiffers && {
          code: SupplierInvoiceFlagCodeValues.PRICE_DIFFERS,
          detail: `PO ${money(line.orderedUnitPrice)}, invoice ${money(line.unitPrice)}.`,
        },
        freeShort && {
          code: SupplierInvoiceFlagCodeValues.FREE_SHORT,
          detail: `Free ${freeOnOrderLine.toString()}, the scheme gives ${schemeFreeQty} on ${billedOnOrderLine.toString()} billed.`,
        },
        shortExpiry && {
          code: SupplierInvoiceFlagCodeValues.SHORT_EXPIRY,
          detail: `Expires ${lineExpiryDate}, ${pluralize('day', shelfLifeDays, true)} after the invoice date; at least ${MIN_SHELF_LIFE_DAYS} expected.`,
        },
      ]);

      lineFlagCountByInvoice.set(
        line.supplierInvoiceId,
        (lineFlagCountByInvoice.get(line.supplierInvoiceId) ?? 0) + flags.length,
      );
      if (!_.isEqual(flags, line.flags)) await this.linesRepository.update(line.id, { flags });
    }

    for (const invoice of invoices) {
      const rateDiffers = invoice.exchangeRate !== invoice.poExchangeRate;
      const flags: SupplierInvoiceLineFlag[] = _.compact([
        rateDiffers && {
          code: SupplierInvoiceFlagCodeValues.RATE_DIFFERS,
          detail: `PO rate ${invoice.poExchangeRate ?? 'none'}, invoice ${invoice.exchangeRate ?? 'none'}.`,
        },
      ]);
      const flagCount = flags.length + (lineFlagCountByInvoice.get(invoice.id) ?? 0);
      if (!_.isEqual(flags, invoice.flags) || flagCount !== invoice.flagCount) {
        await this.invoicesRepository.update(invoice.id, { flags, flagCount });
      }
    }
  }
}
