import type { GoodsReceiptDto } from '@domain/goods-receipts/dto/entity/goods-receipt.dto';
import type { CreateGoodsReceiptDto } from '@domain/goods-receipts/dto/request/create-goods-receipt.dto';
import { GoodsReceiptsDomainService } from '@domain/goods-receipts/services/goods-receipts.service';
import { PurchaseOrdersDomainRepository } from '@domain/purchase-orders/repositories/purchase-orders.repository';
import { SupplierEnrollmentsDomainRepository } from '@domain/supplier-enrollments/repositories/supplier-enrollments.repository';
import { Injectable, Logger } from '@nestjs/common';
import type { CreateResponseDto } from '@vritti/api-sdk/responses';

@Injectable()
export class GoodsReceiptsService {
  private readonly logger = new Logger(GoodsReceiptsService.name);

  constructor(
    private readonly goodsReceiptsService: GoodsReceiptsDomainService,
    private readonly purchaseOrdersRepository: PurchaseOrdersDomainRepository,
    private readonly supplierEnrollmentsRepository: SupplierEnrollmentsDomainRepository,
  ) {}

  // Creates a goods receipt against a confirmed or partially received PO whose supplier its site may still buy from
  async create(dto: CreateGoodsReceiptDto): Promise<CreateResponseDto<GoodsReceiptDto>> {
    const purchaseOrder = await this.purchaseOrdersRepository.findDetailOrThrow(dto.purchaseOrderId);
    this.purchaseOrdersRepository.assertReceivable(purchaseOrder);
    await this.supplierEnrollmentsRepository.assertPurchasable(purchaseOrder.supplierId, purchaseOrder.siteId);

    this.logger.log(`goodsReceipts.create — PO: ${purchaseOrder.poNumber}, site: ${purchaseOrder.siteId}`);
    return this.goodsReceiptsService.create(dto, purchaseOrder);
  }
}
