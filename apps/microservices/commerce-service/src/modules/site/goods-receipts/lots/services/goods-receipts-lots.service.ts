import type { GoodsReceiptLotDto } from '@domain/goods-receipt-lots/dto/entity/goods-receipt-lot.dto';
import type { AddGoodsReceiptLotDto } from '@domain/goods-receipt-lots/dto/request/add-goods-receipt-lot.dto';
import type { UpdateGoodsReceiptLotDto } from '@domain/goods-receipt-lots/dto/request/update-goods-receipt-lot.dto';
import { GoodsReceiptLotsDomainService } from '@domain/goods-receipt-lots/services/goods-receipt-lots.service';
import { GoodsReceiptItemsDomainRepository } from '@domain/goods-receipts/repositories/goods-receipt-items.repository';
import { Injectable } from '@nestjs/common';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';

@Injectable()
export class GoodsReceiptsLotsService {
  constructor(
    private readonly lotsService: GoodsReceiptLotsDomainService,
    private readonly itemsRepository: GoodsReceiptItemsDomainRepository,
  ) {}

  // Adds a lot to an item of a draft receipt
  async addLot(dto: AddGoodsReceiptLotDto, leCurrencyCode: string): Promise<CreateResponseDto<GoodsReceiptLotDto>> {
    const item = await this.itemsRepository.findDraftContextOrThrow(dto.goodsReceiptId, dto.itemId);
    return this.lotsService.addLot(item, dto, leCurrencyCode);
  }

  // Changes a lot of an item of a draft receipt
  async updateLot(dto: UpdateGoodsReceiptLotDto, leCurrencyCode: string): Promise<SuccessResponseDto> {
    const item = await this.itemsRepository.findDraftContextOrThrow(dto.goodsReceiptId, dto.itemId);
    return this.lotsService.updateLot(item, dto, leCurrencyCode);
  }

  // Removes a lot from an item of a draft receipt
  async removeLot(goodsReceiptId: string, itemId: string, lotId: string): Promise<SuccessResponseDto> {
    const item = await this.itemsRepository.findDraftContextOrThrow(goodsReceiptId, itemId);
    return this.lotsService.removeLot(item, lotId);
  }
}
