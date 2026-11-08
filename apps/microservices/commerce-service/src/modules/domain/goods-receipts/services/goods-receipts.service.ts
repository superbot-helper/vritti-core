import { Injectable, Logger } from '@nestjs/common';
import {
  CursorCodec,
  type FieldMap,
  FilterProcessor,
  type KeysetOrderBy,
  KeysetProcessor,
  keysetSignature,
  type SearchState,
  type TableViewState,
} from '@vritti/api-sdk/data-table';
import { and, asc, desc, eq } from '@vritti/api-sdk/drizzle-orm';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { type GoodsReceipt, GoodsReceiptStatusValues, goodsReceipts, parties, purchaseOrders } from '@/db/schema';
import { GoodsReceiptDto } from '../dto/entity/goods-receipt.dto';
import type { CreateGoodsReceiptDto } from '../dto/request/create-goods-receipt.dto';
import { GoodsReceiptsDomainRepository } from '../repositories/goods-receipts.repository';

export const MIN_SHELF_LIFE_DAYS = 180;

export interface GoodsReceiptPurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  siteId: string;
  legalEntityId: string;
}

export interface GoodsReceiptTableScope {
  purchaseOrderId?: string;
}

export interface GoodsReceiptFeedQuery {
  search?: SearchState | null;
  limit?: number;
  cursor?: string;
}

export interface GoodsReceiptFeed {
  edges: { cursor: string; node: GoodsReceiptDto }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

@Injectable()
export class GoodsReceiptsDomainService {
  private readonly logger = new Logger(GoodsReceiptsDomainService.name);

  private static readonly SEARCH_FIELD_MAP: FieldMap = {
    grNumber: { column: goodsReceipts.grNumber, type: 'string' },
    supplierName: { column: parties.displayName, type: 'string' },
    poNumber: { column: purchaseOrders.poNumber, type: 'string' },
  };
  private static readonly FILTER_FIELD_MAP: FieldMap = {
    status: { column: goodsReceipts.status, type: 'string' },
    supplierId: { column: goodsReceipts.supplierId, type: 'string' },
    siteId: { column: goodsReceipts.siteId, type: 'string' },
    sites: { column: goodsReceipts.siteId, type: 'string' },
  };
  private static readonly SORT_FIELD_MAP: FieldMap = {
    ...GoodsReceiptsDomainService.SEARCH_FIELD_MAP,
    ...GoodsReceiptsDomainService.FILTER_FIELD_MAP,
    receivedDate: { column: goodsReceipts.receivedDate, type: 'string' },
  };
  private static readonly FEED_ORDER: (KeysetOrderBy & { key: keyof GoodsReceipt })[] = [
    { column: goodsReceipts.createdAt, direction: 'desc', key: 'createdAt' },
    { column: goodsReceipts.id, direction: 'asc', key: 'id' },
  ];

  constructor(private readonly repository: GoodsReceiptsDomainRepository) {}

  // Returns one page of goods receipts, narrowed to a purchase order when one is named
  async findForTable(
    state: TableViewState,
    scope: GoodsReceiptTableScope = {},
  ): Promise<{ result: GoodsReceiptDto[]; count: number }> {
    const orderBy = FilterProcessor.buildOrderBy(state.sort, GoodsReceiptsDomainService.SORT_FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination;

    const { result, count } = await this.repository.findForTable({
      where: and(
        FilterProcessor.buildWhere(state.filters, GoodsReceiptsDomainService.FILTER_FIELD_MAP),
        FilterProcessor.buildSearch(state.search, GoodsReceiptsDomainService.SEARCH_FIELD_MAP),
        scope.purchaseOrderId ? eq(goodsReceipts.purchaseOrderId, scope.purchaseOrderId) : undefined,
      ),
      orderBy: orderBy.length > 0 ? orderBy : [desc(goodsReceipts.createdAt)],
      limit,
      offset,
    });
    return { result: result.map(GoodsReceiptDto.from), count };
  }

  // Returns a keyset page of goods receipts for the mobile infinite feed, newest first
  async findForFeed(query: GoodsReceiptFeedQuery): Promise<GoodsReceiptFeed> {
    const order = GoodsReceiptsDomainService.FEED_ORDER;
    const signature = keysetSignature(order);
    const { rows, hasMore } = await this.repository.findKeysetForFeed({
      where: and(
        FilterProcessor.buildSearch(query.search, GoodsReceiptsDomainService.SEARCH_FIELD_MAP),
        query.cursor ? KeysetProcessor.buildAfter(order, CursorCodec.decode(query.cursor, signature)) : undefined,
      ),
      orderBy: order.map((entry) => (entry.direction === 'asc' ? asc(entry.column) : desc(entry.column))),
      limit: query.limit ?? 20,
    });

    const edges = rows.map((row) => ({
      cursor: CursorCodec.encode(
        order.map((entry) => row[entry.key]),
        signature,
      ),
      node: GoodsReceiptDto.from(row),
    }));
    return { edges, pageInfo: { hasNextPage: hasMore, endCursor: edges.at(-1)?.cursor ?? null } };
  }

  // Returns one goods receipt header with its purchase order and publish readiness
  async findById(id: string): Promise<GoodsReceiptDto> {
    return GoodsReceiptDto.from(await this.repository.findDetailOrThrow(id));
  }

  // Creates a draft receipt against a receivable PO; its supplier, site and legal entity are the PO's
  async create(
    dto: CreateGoodsReceiptDto,
    purchaseOrder: GoodsReceiptPurchaseOrder,
  ): Promise<CreateResponseDto<GoodsReceiptDto>> {
    const grNumber = await this.repository.generateGrNumber();
    const created = await this.repository.create({
      grNumber,
      purchaseOrderId: purchaseOrder.id,
      supplierId: purchaseOrder.supplierId,
      siteId: purchaseOrder.siteId,
      legalEntityId: purchaseOrder.legalEntityId,
      receivedDate: dto.receivedDate,
      notes: dto.notes ?? null,
    });

    this.logger.log(`Created goods receipt ${grNumber} against PO ${purchaseOrder.poNumber}`);
    return {
      success: true,
      message: `Goods receipt "${grNumber}" created against purchase order "${purchaseOrder.poNumber}".`,
      data: await this.findById(created.id),
    };
  }

  // Marks a draft receipt published once its stock has landed
  async markPublished(id: string): Promise<void> {
    await this.repository.update(id, { status: GoodsReceiptStatusValues.PUBLISHED, publishedAt: new Date() });
    this.logger.log(`Published goods receipt ${id}`);
  }

  // Deletes a draft goods receipt with everything counted on it
  async delete(id: string): Promise<SuccessResponseDto> {
    const receipt = await this.repository.findDraftOrThrow(id, 'Cannot Delete');
    await this.repository.delete(receipt.id);
    this.logger.log(`Deleted goods receipt ${receipt.grNumber} (${receipt.id})`);
    return { success: true, message: `Goods receipt "${receipt.grNumber}" deleted successfully.` };
  }
}
