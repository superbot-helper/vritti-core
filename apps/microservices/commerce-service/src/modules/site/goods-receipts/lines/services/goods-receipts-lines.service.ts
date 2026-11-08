import type { GoodsReceiptLineDto } from '@domain/goods-receipt-lines/dto/entity/goods-receipt-line.dto';
import type { AddGoodsReceiptLineDto } from '@domain/goods-receipt-lines/dto/request/add-goods-receipt-line.dto';
import type { UpdateGoodsReceiptLineDto } from '@domain/goods-receipt-lines/dto/request/update-goods-receipt-line.dto';
import { GoodsReceiptLinesDomainService } from '@domain/goods-receipt-lines/services/goods-receipt-lines.service';
import { GoodsReceiptItemsDomainRepository } from '@domain/goods-receipts/repositories/goods-receipt-items.repository';
import { UomConversionsDomainService } from '@domain/uom-conversions/services/uom-conversions.service';
import { Injectable } from '@nestjs/common';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';

@Injectable()
export class GoodsReceiptsLinesService {
  constructor(
    private readonly linesService: GoodsReceiptLinesDomainService,
    private readonly itemsRepository: GoodsReceiptItemsDomainRepository,
    private readonly uomConversionsService: UomConversionsDomainService,
  ) {}

  // Adds a line to an item of a draft receipt, snapshotting its quantity in the item's primary unit
  async addLine(dto: AddGoodsReceiptLineDto): Promise<CreateResponseDto<GoodsReceiptLineDto>> {
    const item = await this.itemsRepository.findDraftContextOrThrow(dto.goodsReceiptId, dto.itemId);
    const primaryUomQty = await this.uomConversionsService.toPrimaryUomQuantity(
      item.inventoryItemId,
      item.uomId,
      dto.quantity,
    );
    return this.linesService.addLine(item, dto, primaryUomQty);
  }

  // Changes a line of an item of a draft receipt, snapshotting a changed quantity in the item's primary unit
  async updateLine(dto: UpdateGoodsReceiptLineDto): Promise<SuccessResponseDto> {
    const item = await this.itemsRepository.findDraftContextOrThrow(dto.goodsReceiptId, dto.itemId);
    const primaryUomQty =
      dto.quantity === undefined
        ? undefined
        : await this.uomConversionsService.toPrimaryUomQuantity(item.inventoryItemId, item.uomId, dto.quantity);
    return this.linesService.updateLine(item, dto, primaryUomQty);
  }

  // Removes a line from an item of a draft receipt
  async removeLine(goodsReceiptId: string, itemId: string, lineId: string): Promise<SuccessResponseDto> {
    const item = await this.itemsRepository.findDraftContextOrThrow(goodsReceiptId, itemId);
    return this.linesService.removeLine(item, lineId);
  }
}
