import type { GoodsReceiptLotDto } from '@domain/goods-receipt-lots/dto/entity/goods-receipt-lot.dto';
import { GoodsReceiptLotsDomainService } from '@domain/goods-receipt-lots/services/goods-receipt-lots.service';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { GoodsReceiptsLotsService } from '@/modules/site/goods-receipts/lots/services/goods-receipts-lots.service';
import { LeAddGoodsReceiptLotDto } from './dto/request/le-add-goods-receipt-lot.dto';
import { LeUpdateGoodsReceiptLotDto } from './dto/request/le-update-goods-receipt-lot.dto';

@Controller()
export class LeGoodsReceiptsLotsController {
  private readonly logger = new Logger(LeGoodsReceiptsLotsController.name);

  constructor(
    private readonly lotsService: GoodsReceiptLotsDomainService,
    private readonly service: GoodsReceiptsLotsService,
  ) {}

  // Returns the lots of a goods receipt item
  @MessagePattern({ cmd: 'le.goodsReceipts.lots' })
  lots(
    @Payload() data: { goodsReceiptId: string; itemId: string; leCurrencyCode: string },
  ): Promise<GoodsReceiptLotDto[]> {
    this.logger.log(`le.goodsReceipts.lots — item: ${data.itemId}`);
    return this.lotsService.findByItem(data.itemId, data.leCurrencyCode);
  }

  // Adds a lot to a goods receipt item
  @MessagePattern({ cmd: 'le.goodsReceipts.addLot' })
  addLot(@Payload() dto: LeAddGoodsReceiptLotDto): Promise<CreateResponseDto<GoodsReceiptLotDto>> {
    this.logger.log(`le.goodsReceipts.addLot — item: ${dto.itemId}, lot: ${dto.lotNumber}`);
    const { leCurrencyCode, ...lot } = dto;
    return this.service.addLot(lot, leCurrencyCode);
  }

  // Changes a lot of a goods receipt item
  @MessagePattern({ cmd: 'le.goodsReceipts.updateLot' })
  updateLot(@Payload() dto: LeUpdateGoodsReceiptLotDto): Promise<SuccessResponseDto> {
    this.logger.log(`le.goodsReceipts.updateLot — lot: ${dto.lotId}`);
    const { leCurrencyCode, ...lot } = dto;
    return this.service.updateLot(lot, leCurrencyCode);
  }

  // Removes a lot from a goods receipt item
  @MessagePattern({ cmd: 'le.goodsReceipts.removeLot' })
  removeLot(@Payload() data: { goodsReceiptId: string; itemId: string; lotId: string }): Promise<SuccessResponseDto> {
    this.logger.log(`le.goodsReceipts.removeLot — lot: ${data.lotId}`);
    return this.service.removeLot(data.goodsReceiptId, data.itemId, data.lotId);
  }
}
