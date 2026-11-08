import type { GoodsReceiptDto } from '@domain/goods-receipts/dto/entity/goods-receipt.dto';
import { CreateGoodsReceiptDto } from '@domain/goods-receipts/dto/request/create-goods-receipt.dto';
import { GoodsReceiptsDomainService } from '@domain/goods-receipts/services/goods-receipts.service';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { TableViewState } from '@vritti/api-sdk/data-table';
import { type NatsHeaders, RpcNatsHeaders } from '@vritti/api-sdk/nats';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { GoodsReceiptsPublishService } from '@/modules/site/goods-receipts/root/services/goods-receipts-publish.service';
import { GoodsReceiptsService } from '@/modules/site/goods-receipts/root/services/goods-receipts-root.service';

@Controller()
export class LeGoodsReceiptsRootController {
  private readonly logger = new Logger(LeGoodsReceiptsRootController.name);

  constructor(
    private readonly goodsReceiptsService: GoodsReceiptsDomainService,
    private readonly service: GoodsReceiptsService,
    private readonly publishService: GoodsReceiptsPublishService,
  ) {}

  // Creates a goods receipt against a purchase order of one of the legal entity's sites
  @MessagePattern({ cmd: 'le.goodsReceipts.create' })
  create(@Payload() dto: CreateGoodsReceiptDto): Promise<CreateResponseDto<GoodsReceiptDto>> {
    this.logger.log(`le.goodsReceipts.create — purchaseOrder: ${dto.purchaseOrderId}`);
    return this.service.create(dto);
  }

  // Returns one page of the goods receipts of the legal entity's sites
  @MessagePattern({ cmd: 'le.goodsReceipts.table' })
  table(@Payload() state: TableViewState): Promise<{ result: GoodsReceiptDto[]; count: number }> {
    this.logger.log('le.goodsReceipts.table');
    return this.goodsReceiptsService.findForTable(state);
  }

  // Returns one goods receipt
  @MessagePattern({ cmd: 'le.goodsReceipts.findById' })
  findById(@Payload() data: { id: string }): Promise<GoodsReceiptDto> {
    this.logger.log(`le.goodsReceipts.findById — id: ${data.id}`);
    return this.goodsReceiptsService.findById(data.id);
  }

  // Publishes a goods receipt, landing its stock at its site
  @MessagePattern({ cmd: 'le.goodsReceipts.publish' })
  publish(
    @Payload() data: { id: string; leCurrencyCode: string },
    @RpcNatsHeaders() headers: NatsHeaders,
  ): Promise<GoodsReceiptDto> {
    this.logger.log(`le.goodsReceipts.publish — id: ${data.id}`);
    return this.publishService.publish(data.id, data.leCurrencyCode, headers);
  }

  // Deletes a draft goods receipt
  @MessagePattern({ cmd: 'le.goodsReceipts.delete' })
  delete(@Payload() data: { id: string }): Promise<SuccessResponseDto> {
    this.logger.log(`le.goodsReceipts.delete — id: ${data.id}`);
    return this.goodsReceiptsService.delete(data.id);
  }
}
