import { Injectable } from '@nestjs/common';
import Decimal from '@vritti/api-sdk/decimal';
import _ from '@vritti/api-sdk/lodash';
import { convertMinor } from '@/common/convert-minor';
import {
  CostDistributionMethodValues,
  CostSourceTypeValues,
  type SupplierInvoice,
  SupplierInvoiceStatusValues,
} from '@/db/schema';
import {
  type QuantVarianceAllocation,
  SupplierInvoiceCostingDomainRepository,
} from '../repositories/supplier-invoice-costing.repository';
import { SupplierInvoiceLinesDomainRepository } from '../repositories/supplier-invoice-lines.repository';
import { SupplierInvoicesDomainRepository } from '../repositories/supplier-invoices.repository';

export type CostingDirection = 'apply' | 'reverse';

@Injectable()
export class SupplierInvoiceCostingDomainService {
  constructor(
    private readonly repository: SupplierInvoiceCostingDomainRepository,
    private readonly invoicesRepository: SupplierInvoicesDomainRepository,
    private readonly linesRepository: SupplierInvoiceLinesDomainRepository,
  ) {}

  // Applies or reverses an invoice's final costing in the caller's transaction; the consumed share's difference is each line's variance
  async revalue(supplierInvoiceId: string, leCurrencyCode: string, direction: CostingDirection): Promise<void> {
    const invoice = await this.invoicesRepository.findDetailOrThrow(supplierInvoiceId);
    const slices = await this.repository.findCostingSlices(supplierInvoiceId);
    const sign = direction === 'apply' ? 1 : -1;
    if (direction === 'reverse') {
      await this.repository.deleteVariance(supplierInvoiceId);
      await this.linesRepository.clearVariance(supplierInvoiceId);
    }

    const allocations: QuantVarianceAllocation[] = [];
    for (const [lineId, lineSlices] of Object.entries(_.groupBy(slices, 'supplierInvoiceLineId'))) {
      const [line] = lineSlices;
      const primaryPerOrderUnit = new Decimal(line.orderedPrimaryQty).div(line.orderedQty);

      // The provisional cost goods receipt publish valued the stock at, per primary unit in the legal entity's currency
      const orderedTotalInLeCurrency = convertMinor(
        line.orderedTotalPrice,
        line.currencyCode,
        leCurrencyCode,
        line.orderExchangeRate,
      );
      const orderedPrimaryUnitsWithFree = new Decimal(line.orderedQty)
        .plus(line.expectedFreeQty)
        .times(primaryPerOrderUnit);
      const provisionalUnitCost = new Decimal(orderedTotalInLeCurrency.toString())
        .div(orderedPrimaryUnitsWithFree)
        .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

      // The final cost per primary unit: what the line bills net of discount and before tax, over billed + free
      const billedGrossAmount = new Decimal(line.unitPrice.toString())
        .times(line.billedQty)
        .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
      const billedNetAmount = BigInt(billedGrossAmount.toFixed(0)) - line.discountAmount;
      const billedNetInLeCurrency = convertMinor(billedNetAmount, line.currencyCode, leCurrencyCode, line.exchangeRate);
      const billedPrimaryUnitsWithFree = new Decimal(line.billedQty).plus(line.freeQty).times(primaryPerOrderUnit);
      const finalUnitCost = new Decimal(billedNetInLeCurrency.toString())
        .div(billedPrimaryUnitsWithFree)
        .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

      const costChangePerUnit = finalUnitCost.minus(provisionalUnitCost).times(sign);
      if (costChangePerUnit.isZero()) continue;

      let lineVariance = 0n;
      for (const [quantId, quantSlices] of Object.entries(_.groupBy(lineSlices, 'quantId'))) {
        const [{ quantQuantity, quantInflowQty }] = quantSlices;
        const linkedPrimaryQty = quantSlices.reduce(
          (total, slice) =>
            total.plus(new Decimal(slice.receivedPrimaryQty).times(slice.linkedQty).div(slice.receivedQty)),
          new Decimal(0),
        );
        const onHandShare = Decimal.min(1, new Decimal(quantQuantity).div(quantInflowQty));
        const costDelta = costChangePerUnit.times(linkedPrimaryQty).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
        const onHandDelta = costDelta.times(onHandShare).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
        const costDeltaAmount = BigInt(costDelta.toFixed(0));
        const onHandDeltaAmount = BigInt(onHandDelta.toFixed(0));

        await this.repository.revalueQuant(quantId, costDeltaAmount, onHandDeltaAmount);
        lineVariance += costDeltaAmount - onHandDeltaAmount;
        if (costDeltaAmount !== 0n) allocations.push({ quantId, allocatedAmount: costDeltaAmount });
      }
      if (direction === 'apply') await this.linesRepository.update(lineId, { varianceAmount: lineVariance });
    }

    if (direction === 'reverse' || allocations.length === 0) return;
    const categoryId = await this.repository.findItemCategoryId();
    if (!categoryId) return;

    const allocatedByQuant = Object.entries(_.groupBy(allocations, 'quantId')).map(([quantId, quantAllocations]) => ({
      quantId,
      allocatedAmount: quantAllocations.reduce((total, allocation) => total + allocation.allocatedAmount, 0n),
    }));
    await this.repository.recordVariance(
      {
        categoryId,
        totalAmount: allocatedByQuant.reduce((total, allocation) => total + allocation.allocatedAmount, 0n),
        currencyCode: leCurrencyCode,
        sourceType: CostSourceTypeValues.SUPPLIER_INVOICE,
        sourceId: supplierInvoiceId,
        distributionMethod: CostDistributionMethodValues.BY_QUANTITY,
        unallocatedAmount: 0n,
        vendorRef: invoice.invoiceNumber,
        notes: 'Supplier invoice price variance',
      },
      allocatedByQuant,
    );
  }

  // Runs a change to an invoice inside the caller's transaction; a posted invoice's costing is reversed before the change
  // and re-applied after it, so its stock carries the edited final cost
  async withRecosting(
    invoice: Pick<SupplierInvoice, 'id' | 'status'>,
    leCurrencyCode: string,
    change: () => Promise<void>,
  ): Promise<void> {
    if (invoice.status !== SupplierInvoiceStatusValues.POSTED) return change();
    await this.revalue(invoice.id, leCurrencyCode, 'reverse');
    await change();
    await this.revalue(invoice.id, leCurrencyCode, 'apply');
  }
}
