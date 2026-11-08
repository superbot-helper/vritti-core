import type { GoodsReceiptLineItemDto } from '@domain/goods-receipt-line-items/dto/entity/goods-receipt-line-item.dto';
import type { AddGoodsReceiptLineItemDto } from '@domain/goods-receipt-line-items/dto/request/add-goods-receipt-line-item.dto';
import { GoodsReceiptLineItemsDomainService } from '@domain/goods-receipt-line-items/services/goods-receipt-line-items.service';
import { GoodsReceiptLinesDomainRepository } from '@domain/goods-receipt-lines/repositories/goods-receipt-lines.repository';
import { GoodsReceiptLinesDomainService } from '@domain/goods-receipt-lines/services/goods-receipt-lines.service';
import { GoodsReceiptItemsDomainRepository } from '@domain/goods-receipts/repositories/goods-receipt-items.repository';
import { Injectable } from '@nestjs/common';
import { PrimaryDatabaseService } from '@vritti/api-sdk/database';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';

@Injectable()
export class GoodsReceiptsLineItemsService {
  constructor(
    private readonly database: PrimaryDatabaseService,
    private readonly lineItemsService: GoodsReceiptLineItemsDomainService,
    private readonly linesService: GoodsReceiptLinesDomainService,
    private readonly linesRepository: GoodsReceiptLinesDomainRepository,
    private readonly itemsRepository: GoodsReceiptItemsDomainRepository,
  ) {}

  // Registers a serial on a line of a draft receipt and re-checks whether the line's serials are complete
  async addLineItem(dto: AddGoodsReceiptLineItemDto): Promise<CreateResponseDto<GoodsReceiptLineItemDto>> {
    const item = await this.itemsRepository.findDraftContextOrThrow(dto.goodsReceiptId, dto.itemId);
    const line = await this.linesRepository.findOnItemOrThrow(item.id, dto.lineId);
    return this.database.runInTransaction(async () => {
      const created = await this.lineItemsService.addLineItem(item, line, dto);
      await this.linesService.refreshIsBalanced(line.id, item.tracking);
      return created;
    });
  }

  // Removes a serial from a line of a draft receipt and re-checks whether the line's serials are complete
  async removeLineItem(
    goodsReceiptId: string,
    itemId: string,
    lineId: string,
    lineItemId: string,
  ): Promise<SuccessResponseDto> {
    const item = await this.itemsRepository.findDraftContextOrThrow(goodsReceiptId, itemId);
    const line = await this.linesRepository.findOnItemOrThrow(item.id, lineId);
    return this.database.runInTransaction(async () => {
      const removed = await this.lineItemsService.removeLineItem(line, lineItemId);
      await this.linesService.refreshIsBalanced(line.id, item.tracking);
      return removed;
    });
  }
}
