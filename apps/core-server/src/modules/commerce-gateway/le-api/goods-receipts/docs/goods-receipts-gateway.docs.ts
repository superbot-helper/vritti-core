import { AddGoodsReceiptItemDto } from '@commerce/goods-receipts/dto/request/add-goods-receipt-item.dto';
import { AddGoodsReceiptLineDto } from '@commerce/goods-receipts/dto/request/add-goods-receipt-line.dto';
import { AddGoodsReceiptLineItemDto } from '@commerce/goods-receipts/dto/request/add-goods-receipt-line-item.dto';
import { CreateGoodsReceiptDto } from '@commerce/goods-receipts/dto/request/create-goods-receipt.dto';
import { LeAddGoodsReceiptLotDto } from '@commerce/goods-receipts/dto/request/le-add-goods-receipt-lot.dto';
import { LeUpdateGoodsReceiptLotDto } from '@commerce/goods-receipts/dto/request/le-update-goods-receipt-lot.dto';
import { UpdateGoodsReceiptItemDto } from '@commerce/goods-receipts/dto/request/update-goods-receipt-item.dto';
import { UpdateGoodsReceiptLineDto } from '@commerce/goods-receipts/dto/request/update-goods-receipt-line.dto';
import { GoodsReceiptItemQuantsResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-item-quants-response.dto';
import { GoodsReceiptItemResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-item-response.dto';
import { GoodsReceiptItemTableResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-item-table-response.dto';
import { GoodsReceiptItemsCostResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-items-cost-response.dto';
import { GoodsReceiptLineItemResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-line-item-response.dto';
import { GoodsReceiptLineItemTableResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-line-item-table-response.dto';
import { GoodsReceiptLineResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-line-response.dto';
import { GoodsReceiptLineTableResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-line-table-response.dto';
import { GoodsReceiptLotResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-lot-response.dto';
import { GoodsReceiptTreeNodeResponseDto } from '@commerce/goods-receipts/dto/response/goods-receipt-tree-response.dto';
import { LeGoodsReceiptResponseDto } from '@commerce/goods-receipts/dto/response/le-goods-receipt-response.dto';
import { LeGoodsReceiptTableResponseDto } from '@commerce/goods-receipts/dto/response/le-goods-receipt-table-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk/responses';

export function ApiCreate() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a goods receipt',
      description:
        "Creates a draft receipt against a confirmed or partially received purchase order of one of the legal entity's sites; its supplier and site are the order's.",
    }),
    ApiBody({ type: CreateGoodsReceiptDto }),
    ApiResponse({ status: 201, description: 'Goods receipt created.', type: LeGoodsReceiptResponseDto }),
    ApiResponse({
      status: 400,
      description: 'The purchase order is not open for receiving, or the supplier is blocked at the site.',
    }),
    ApiResponse({ status: 404, description: 'Purchase order not found.' }),
  );
}

export function ApiFindForTable() {
  return applyDecorators(
    ApiOperation({
      summary: 'List goods receipts',
      description:
        "Returns a page of the goods receipts of the legal entity's sites with site names, using the user's saved table state; the sites picked in the table's context bar (`filters.context`) narrow it.",
    }),
    ApiResponse({ status: 200, description: 'Goods receipts retrieved.', type: LeGoodsReceiptTableResponseDto }),
  );
}

export function ApiFindById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a goods receipt',
      description: 'Returns the receipt with its purchase order and whether it is ready to publish.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiResponse({ status: 200, description: 'Goods receipt retrieved.', type: LeGoodsReceiptResponseDto }),
    ApiResponse({ status: 404, description: 'Goods receipt not found.' }),
  );
}

export function ApiTree() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the item tree of a goods receipt',
      description: 'Returns the items with their lots and lines below them, each with its distribution progress.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiResponse({ status: 200, description: 'Tree retrieved.', type: GoodsReceiptTreeNodeResponseDto }),
  );
}

export function ApiPublish() {
  return applyDecorators(
    ApiOperation({
      summary: 'Publish a goods receipt',
      description:
        "Lands the accepted stock at the receipt's site valued provisionally from the purchase order lines, and moves the order's received quantities and status. Over-receipt and short expiry are only flagged.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiResponse({ status: 201, description: 'Goods receipt published.', type: LeGoodsReceiptResponseDto }),
    ApiResponse({
      status: 400,
      description: 'The receipt is already published or not every item is fully distributed.',
    }),
    ApiResponse({ status: 404, description: 'Goods receipt not found.' }),
  );
}

export function ApiDelete() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a goods receipt',
      description: 'Deletes a draft receipt with everything counted on it.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiResponse({ status: 200, description: 'Goods receipt deleted.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'The receipt is published.' }),
    ApiResponse({ status: 404, description: 'Goods receipt not found.' }),
  );
}

export function ApiInventoryItemIds() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the inventory items on a goods receipt',
      description: 'Returns the ids of the inventory items counted on the receipt.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiResponse({ status: 200, description: 'Inventory item ids retrieved.', type: [String] }),
  );
}

export function ApiItemsTable() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the items of a goods receipt',
      description:
        "Returns a page of the receipt's items with their purchase order context and flags, using the user's saved table state.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiResponse({ status: 200, description: 'Goods receipt items retrieved.', type: GoodsReceiptItemTableResponseDto }),
  );
}

export function ApiItemsCost() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the provisional cost of a goods receipt',
      description:
        "Returns each item's cost per primary unit and value in the legal entity's currency, from its purchase order line; read-only until a supplier invoice sets the final cost.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiResponse({ status: 200, description: 'Provisional cost retrieved.', type: GoodsReceiptItemsCostResponseDto }),
  );
}

export function ApiItemQuants() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the quants of a goods receipt item',
      description: 'Returns the quants a published receipt item landed in, with their cost.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiResponse({ status: 200, description: 'Quants retrieved.', type: GoodsReceiptItemQuantsResponseDto }),
  );
}

export function ApiAddItemFromPurchaseOrderItem() {
  return applyDecorators(
    ApiOperation({
      summary: 'Count a purchase order line',
      description:
        "Adds a line of the receipt's purchase order with the quantity received and rejected; the item and unit are the line's.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiBody({ type: AddGoodsReceiptItemDto }),
    ApiResponse({ status: 201, description: 'Item added.', type: GoodsReceiptItemResponseDto }),
    ApiResponse({ status: 400, description: 'The receipt is published or more is rejected than received.' }),
    ApiResponse({ status: 404, description: "Purchase order line not found on the receipt's order." }),
    ApiResponse({ status: 409, description: 'The purchase order line is already on the receipt.' }),
  );
}

export function ApiItemDetail() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a goods receipt item',
      description: 'Returns the item with its purchase order context, distribution progress and flags.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiResponse({ status: 200, description: 'Goods receipt item retrieved.', type: GoodsReceiptItemResponseDto }),
    ApiResponse({ status: 404, description: 'Goods receipt item not found.' }),
  );
}

export function ApiUpdateItem() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a goods receipt item',
      description: 'Changes the received or rejected quantity of an item on a draft receipt.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiBody({ type: UpdateGoodsReceiptItemDto }),
    ApiResponse({ status: 200, description: 'Item updated.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'The receipt is published or more is rejected than received.' }),
    ApiResponse({ status: 404, description: 'Goods receipt item not found.' }),
  );
}

export function ApiRemoveItem() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a goods receipt item',
      description: 'Removes an item, with its lots and lines, from a draft receipt.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiResponse({ status: 200, description: 'Item removed.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'The receipt is published.' }),
    ApiResponse({ status: 404, description: 'Goods receipt item not found.' }),
  );
}

export function ApiLots() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the lots of a goods receipt item',
      description: "Returns the item's lots with how much their lines hold.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiResponse({ status: 200, description: 'Lots retrieved.', type: [GoodsReceiptLotResponseDto] }),
  );
}

export function ApiAddLot() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a lot to a goods receipt item',
      description: 'Adds a lot with its dates and printed MRP to a lot-tracked item of a draft receipt.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiBody({ type: LeAddGoodsReceiptLotDto }),
    ApiResponse({ status: 201, description: 'Lot added.', type: GoodsReceiptLotResponseDto }),
    ApiResponse({
      status: 400,
      description:
        "The receipt is published, the item is not lot-tracked or the MRP is not in the legal entity's currency.",
    }),
    ApiResponse({ status: 409, description: 'The lot number is already on the item.' }),
  );
}

export function ApiUpdateLot() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a goods receipt lot',
      description: 'Changes the number, dates or printed MRP of a lot on a draft receipt.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lotId', description: 'Goods receipt lot ID' }),
    ApiBody({ type: LeUpdateGoodsReceiptLotDto }),
    ApiResponse({ status: 200, description: 'Lot updated.', type: SuccessResponseDto }),
    ApiResponse({ status: 404, description: 'Goods receipt lot not found.' }),
    ApiResponse({ status: 409, description: 'The lot number is already on the item.' }),
  );
}

export function ApiRemoveLot() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a goods receipt lot',
      description: 'Removes a lot, with the lines it is distributed to, from a draft receipt.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lotId', description: 'Goods receipt lot ID' }),
    ApiResponse({ status: 200, description: 'Lot removed.', type: SuccessResponseDto }),
    ApiResponse({ status: 404, description: 'Goods receipt lot not found.' }),
  );
}

export function ApiLinesTable() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the lines of a goods receipt item',
      description: "Returns a page of the item's lines using the user's saved table state.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiResponse({ status: 200, description: 'Lines retrieved.', type: GoodsReceiptLineTableResponseDto }),
  );
}

export function ApiLinesByLotTable() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the lines of a goods receipt lot',
      description: "Returns a page of the lines the lot is distributed to, using the user's saved table state.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lotId', description: 'Goods receipt lot ID' }),
    ApiResponse({ status: 200, description: 'Lines retrieved.', type: GoodsReceiptLineTableResponseDto }),
  );
}

export function ApiLineById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a goods receipt line',
      description: 'Returns the line with its location and lot.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lineId', description: 'Goods receipt line ID' }),
    ApiResponse({ status: 200, description: 'Line retrieved.', type: GoodsReceiptLineResponseDto }),
    ApiResponse({ status: 404, description: 'Goods receipt line not found.' }),
  );
}

export function ApiAddLine() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a line to a goods receipt item',
      description:
        "Puts part of the item's accepted quantity at a location, in one of its lots when it is lot-tracked.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiBody({ type: AddGoodsReceiptLineDto }),
    ApiResponse({ status: 201, description: 'Line added.', type: GoodsReceiptLineResponseDto }),
    ApiResponse({
      status: 400,
      description: "The line exceeds the item's accepted quantity or its lot does not suit the item.",
    }),
    ApiResponse({ status: 409, description: 'The item already has a line at the location.' }),
  );
}

export function ApiUpdateLine() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a goods receipt line',
      description: 'Moves a line to another lot or location, or changes its quantity.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lineId', description: 'Goods receipt line ID' }),
    ApiBody({ type: UpdateGoodsReceiptLineDto }),
    ApiResponse({ status: 200, description: 'Line updated.', type: SuccessResponseDto }),
    ApiResponse({
      status: 400,
      description: "The line exceeds the item's accepted quantity or its lot does not suit the item.",
    }),
    ApiResponse({ status: 409, description: 'The item already has a line at the location.' }),
  );
}

export function ApiRemoveLine() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a goods receipt line',
      description: 'Removes a line, with its serials, from a draft receipt.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lineId', description: 'Goods receipt line ID' }),
    ApiResponse({ status: 200, description: 'Line removed.', type: SuccessResponseDto }),
    ApiResponse({ status: 404, description: 'Goods receipt line not found.' }),
  );
}

export function ApiLineItemsTable() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the serials of a goods receipt line',
      description: "Returns a page of the serials registered on the line, using the user's saved table state.",
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lineId', description: 'Goods receipt line ID' }),
    ApiResponse({ status: 200, description: 'Serials retrieved.', type: GoodsReceiptLineItemTableResponseDto }),
  );
}

export function ApiAddLineItem() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a serial on a goods receipt line',
      description: 'Registers a new serial on a line of a serial-tracked item, up to the line quantity.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lineId', description: 'Goods receipt line ID' }),
    ApiBody({ type: AddGoodsReceiptLineItemDto }),
    ApiResponse({ status: 201, description: 'Serial added.', type: GoodsReceiptLineItemResponseDto }),
    ApiResponse({ status: 400, description: 'The item is not serial-tracked.' }),
    ApiResponse({ status: 409, description: 'The line is full, or the serial is already on it or in inventory.' }),
  );
}

export function ApiRemoveLineItem() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a serial from a goods receipt line',
      description: 'Removes a serial from a line of a draft receipt.',
    }),
    ApiParam({ name: 'id', description: 'Goods receipt ID' }),
    ApiParam({ name: 'itemId', description: 'Goods receipt item ID' }),
    ApiParam({ name: 'lineId', description: 'Goods receipt line ID' }),
    ApiParam({ name: 'subItemId', description: 'Serial (line item) ID' }),
    ApiResponse({ status: 200, description: 'Serial removed.', type: SuccessResponseDto }),
    ApiResponse({ status: 404, description: 'Serial not found on the line.' }),
  );
}
