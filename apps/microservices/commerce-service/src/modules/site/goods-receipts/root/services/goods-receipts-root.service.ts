import type { GoodsReceiptDto } from '@domain/goods-receipts/dto/entity/goods-receipt.dto';
import type { CreateGoodsReceiptDto } from '@domain/goods-receipts/dto/request/create-goods-receipt.dto';
import { GoodsReceiptsDomainService } from '@domain/goods-receipts/services/goods-receipts.service';
import { SupplierEnrollmentsDomainRepository } from '@domain/supplier-enrollments/repositories/supplier-enrollments.repository';
import { Injectable, Logger } from '@nestjs/common';
import type { CreateResponseDto } from '@vritti/api-sdk/responses';

@Injectable()
export class GoodsReceiptsService {
  private readonly logger = new Logger(GoodsReceiptsService.name);

  constructor(
    private readonly goodsReceiptsService: GoodsReceiptsDomainService,
    private readonly supplierEnrollmentsRepository: SupplierEnrollmentsDomainRepository,
  ) {}

  // Creates a goods receipt after gating the supplier on enrollment, active status and purchasing blocks at the site
  async create(
    dto: CreateGoodsReceiptDto,
    siteId: string,
    siteCurrencyCode: string,
  ): Promise<CreateResponseDto<GoodsReceiptDto>> {
    await this.supplierEnrollmentsRepository.assertPurchasable(dto.supplierId, siteId);
    this.logger.log(`goodsReceipts.create — supplier: ${dto.supplierId}`);
    return this.goodsReceiptsService.create(dto, siteCurrencyCode);
  }
}
