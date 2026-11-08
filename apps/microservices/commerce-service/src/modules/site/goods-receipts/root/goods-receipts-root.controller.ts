import type { GoodsReceiptDto } from '@domain/goods-receipts/dto/entity/goods-receipt.dto';
import { CreateGoodsReceiptDto } from '@domain/goods-receipts/dto/request/create-goods-receipt.dto';
import {
  type GoodsReceiptFeed,
  type GoodsReceiptFeedQuery,
  GoodsReceiptsDomainService,
} from '@domain/goods-receipts/services/goods-receipts.service';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { TableViewState } from '@vritti/api-sdk/data-table';
import { type NatsHeaders, RpcNatsHeaders } from '@vritti/api-sdk/nats';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { GoodsReceiptsPublishService } from './services/goods-receipts-publish.service';
import { GoodsReceiptsService } from './services/goods-receipts-root.service';

@Controller()
export class GoodsReceiptsRootController {
  private readonly logger = new Logger(GoodsReceiptsRootController.name);

  constructor(
    private readonly goodsReceiptsService: GoodsReceiptsDomainService,
    private readonly service: GoodsReceiptsService,
    private readonly publishService: GoodsReceiptsPublishService,
  ) {}

  // Creates a goods receipt against one of the site's purchase orders
  @MessagePattern({ cmd: 'site.goodsReceipts.create' })
  create(@Payload() dto: CreateGoodsReceiptDto): Promise<CreateResponseDto<GoodsReceiptDto>> {
    this.logger.log(`site.goodsReceipts.create — purchaseOrder: ${dto.purchaseOrderId}`);
    return this.service.create(dto);
  }

  // Returns one page of the site's goods receipts
  @MessagePattern({ cmd: 'site.goodsReceipts.table' })
  table(@Payload() state: TableViewState): Promise<{ result: GoodsReceiptDto[]; count: number }> {
    this.logger.log('site.goodsReceipts.table');
    return this.goodsReceiptsService.findForTable(state);
  }

  // Returns a keyset page of the site's goods receipts for the mobile feed
  @MessagePattern({ cmd: 'site.goodsReceipts.feed' })
  feed(@Payload() query: GoodsReceiptFeedQuery): Promise<GoodsReceiptFeed> {
    this.logger.log('site.goodsReceipts.feed');
    return this.goodsReceiptsService.findForFeed(query);
  }

  // Returns one goods receipt
  @MessagePattern({ cmd: 'site.goodsReceipts.findById' })
  findById(@Payload() data: { id: string }): Promise<GoodsReceiptDto> {
    this.logger.log(`site.goodsReceipts.findById — id: ${data.id}`);
    return this.goodsReceiptsService.findById(data.id);
  }

  // Publishes a goods receipt, landing its stock at the site
  @MessagePattern({ cmd: 'site.goodsReceipts.publish' })
  publish(@Payload() data: { id: string }, @RpcNatsHeaders() headers: NatsHeaders): Promise<GoodsReceiptDto> {
    this.logger.log(`site.goodsReceipts.publish — id: ${data.id}`);
    return this.publishService.publish(data.id, headers.siteCurrencyCode, headers);
  }

  // Deletes a draft goods receipt
  @MessagePattern({ cmd: 'site.goodsReceipts.delete' })
  delete(@Payload() data: { id: string }): Promise<SuccessResponseDto> {
    this.logger.log(`site.goodsReceipts.delete — id: ${data.id}`);
    return this.goodsReceiptsService.delete(data.id);
  }
}
