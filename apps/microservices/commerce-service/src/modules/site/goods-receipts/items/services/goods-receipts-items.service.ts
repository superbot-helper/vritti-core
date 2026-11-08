import type { GoodsReceiptItemDto } from '@domain/goods-receipts/dto/entity/goods-receipt-item.dto';
import type { AddGoodsReceiptItemDto } from '@domain/goods-receipts/dto/request/add-goods-receipt-item.dto';
import { GoodsReceiptsDomainRepository } from '@domain/goods-receipts/repositories/goods-receipts.repository';
import { GoodsReceiptItemsDomainService } from '@domain/goods-receipts/services/goods-receipt-items.service';
import { PurchaseOrderItemsDomainRepository } from '@domain/purchase-order-items/repositories/purchase-order-items.repository';
import { Injectable } from '@nestjs/common';
import type { CreateResponseDto } from '@vritti/api-sdk/responses';

@Injectable()
export class GoodsReceiptsItemsService {
  constructor(
    private readonly itemsService: GoodsReceiptItemsDomainService,
    private readonly goodsReceiptsRepository: GoodsReceiptsDomainRepository,
    private readonly purchaseOrderItemsRepository: PurchaseOrderItemsDomainRepository,
  ) {}

  // Counts a line of the receipt's own purchase order on a draft receipt
  async addItem(dto: AddGoodsReceiptItemDto): Promise<CreateResponseDto<GoodsReceiptItemDto>> {
    const receipt = await this.goodsReceiptsRepository.findDraftOrThrow(dto.goodsReceiptId, 'Cannot Add Item');
    const purchaseOrderItem = await this.purchaseOrderItemsRepository.findOnPurchaseOrderOrThrow(
      receipt.purchaseOrderId,
      dto.purchaseOrderItemId,
    );
    return this.itemsService.addItem(receipt, purchaseOrderItem, dto);
  }
}
