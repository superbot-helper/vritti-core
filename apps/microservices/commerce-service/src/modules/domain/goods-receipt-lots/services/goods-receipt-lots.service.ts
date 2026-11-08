import { Injectable, Logger } from '@nestjs/common';
import { type CurrencyCode, majorToMinor } from '@vritti/api-sdk/money';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import type { InventoryTracking } from '@/db/schema';
import { GoodsReceiptLotDto } from '../dto/entity/goods-receipt-lot.dto';
import type { AddGoodsReceiptLotDto } from '../dto/request/add-goods-receipt-lot.dto';
import type { UpdateGoodsReceiptLotDto } from '../dto/request/update-goods-receipt-lot.dto';
import { GoodsReceiptLotsDomainRepository } from '../repositories/goods-receipt-lots.repository';

export interface GoodsReceiptLotItem {
  id: string;
  siteId: string;
  tracking: InventoryTracking;
}

@Injectable()
export class GoodsReceiptLotsDomainService {
  private readonly logger = new Logger(GoodsReceiptLotsDomainService.name);

  constructor(private readonly repository: GoodsReceiptLotsDomainRepository) {}

  // Returns the lots of a receipt item, their MRP in the legal entity's currency
  async findByItem(itemId: string, leCurrencyCode: string): Promise<GoodsReceiptLotDto[]> {
    const lots = await this.repository.findByItemId(itemId);
    return lots.map((lot) => GoodsReceiptLotDto.from(lot, leCurrencyCode));
  }

  // Adds a lot to a lot-tracked item of a draft receipt; its MRP is printed in the legal entity's currency
  async addLot(
    item: GoodsReceiptLotItem,
    dto: AddGoodsReceiptLotDto,
    leCurrencyCode: string,
  ): Promise<CreateResponseDto<GoodsReceiptLotDto>> {
    this.repository.assertLotTracked(item);
    await this.repository.assertLotNumberFree(item.id, dto.lotNumber);
    this.repository.assertMrpInCurrency(dto.mrp, leCurrencyCode);

    const created = await this.repository.create({
      goodsReceiptItemId: item.id,
      siteId: item.siteId,
      lotNumber: dto.lotNumber,
      manufacturingDate: dto.manufacturingDate ?? null,
      expiryDate: dto.expiryDate,
      mrp: dto.mrp ? majorToMinor(dto.mrp.value, dto.mrp.currency as CurrencyCode, 'mrp') : null,
    });

    this.logger.log(`Added lot ${dto.lotNumber} to goods receipt item ${item.id}`);
    return {
      success: true,
      message: `Lot "${dto.lotNumber}" added successfully.`,
      data: GoodsReceiptLotDto.from(await this.repository.findOnItemOrThrow(item.id, created.id), leCurrencyCode),
    };
  }

  // Changes a lot's number, dates or MRP on a draft receipt
  async updateLot(
    item: GoodsReceiptLotItem,
    dto: UpdateGoodsReceiptLotDto,
    leCurrencyCode: string,
  ): Promise<SuccessResponseDto> {
    const lot = await this.repository.findOnItemOrThrow(item.id, dto.lotId);
    if (dto.lotNumber !== undefined && dto.lotNumber !== lot.lotNumber) {
      await this.repository.assertLotNumberFree(item.id, dto.lotNumber, lot.id);
    }
    this.repository.assertMrpInCurrency(dto.mrp, leCurrencyCode);

    await this.repository.update(lot.id, {
      lotNumber: dto.lotNumber,
      manufacturingDate: dto.manufacturingDate,
      expiryDate: dto.expiryDate,
      mrp: dto.mrp ? majorToMinor(dto.mrp.value, dto.mrp.currency as CurrencyCode, 'mrp') : dto.mrp,
    });
    this.logger.log(`Updated lot ${lot.id} on goods receipt item ${item.id}`);
    return { success: true, message: `Lot "${dto.lotNumber ?? lot.lotNumber}" updated successfully.` };
  }

  // Removes a lot, with the lines it is distributed to, from a draft receipt
  async removeLot(item: GoodsReceiptLotItem, lotId: string): Promise<SuccessResponseDto> {
    const lot = await this.repository.findOnItemOrThrow(item.id, lotId);
    await this.repository.delete(lot.id);
    this.logger.log(`Removed lot ${lot.lotNumber} from goods receipt item ${item.id}`);
    return { success: true, message: `Lot "${lot.lotNumber}" removed successfully.` };
  }
}
