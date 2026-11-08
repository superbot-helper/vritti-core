import { CreateSupplierInvoiceDto } from '@commerce/supplier-invoices/dto/request/create-supplier-invoice.dto';
import { SupplierInvoiceLineDto } from '@commerce/supplier-invoices/dto/request/supplier-invoice-line.dto';
import { UpdateSupplierInvoiceDto } from '@commerce/supplier-invoices/dto/request/update-supplier-invoice.dto';
import type {
  SupplierInvoiceDetailResponseDto,
  SupplierInvoiceResponseDto,
} from '@commerce/supplier-invoices/dto/response/supplier-invoice-response.dto';
import type { SupplierInvoiceTableResponseDto } from '@commerce/supplier-invoices/dto/response/supplier-invoice-table-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthType, Require, UserId } from '@vritti/api-sdk/auth';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { LE_SUPPLIER_INVOICES } from '@vritti/commerce-permissions/supplier-invoices';
import { SessionTypeValues } from '@/db/schema';
import { RequireFeature, RequirePermission } from '@/rbac/decorators';
import { LegalEntityId, OrgId } from '@/security/decorators';
import {
  ApiCancelSupplierInvoice,
  ApiCreateSupplierInvoice,
  ApiCreateSupplierInvoiceLine,
  ApiDeleteSupplierInvoice,
  ApiDeleteSupplierInvoiceLine,
  ApiFindForTableSupplierInvoices,
  ApiFindSupplierInvoiceById,
  ApiPostSupplierInvoice,
  ApiUpdateSupplierInvoice,
  ApiUpdateSupplierInvoiceLine,
} from './docs/supplier-invoices-gateway.docs';
import { SupplierInvoicesGatewayService } from './services/supplier-invoices-gateway.service';

@ApiTags('Commerce - Supplier Invoices')
@ApiBearerAuth()
@Require(AuthType.Session, SessionTypeValues.WEB)
@RequireFeature(LE_SUPPLIER_INVOICES.featureCode)
@Controller('le/supplier-invoices')
export class SupplierInvoicesGatewayController {
  private readonly logger = new Logger(SupplierInvoicesGatewayController.name);

  constructor(private readonly service: SupplierInvoicesGatewayService) {}

  // Returns the invoices of the legal entity's sites for the data table
  @Get('table')
  @RequirePermission(LE_SUPPLIER_INVOICES.view)
  @ApiFindForTableSupplierInvoices()
  findForTable(@UserId() userId: string, @OrgId() orgId: string): Promise<SupplierInvoiceTableResponseDto> {
    this.logger.log('GET /commerce-api/le/supplier-invoices/table');
    return this.service.findForTable(userId, orgId);
  }

  // Records a draft invoice billing a purchase order
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(LE_SUPPLIER_INVOICES.add)
  @ApiCreateSupplierInvoice()
  create(@Body() dto: CreateSupplierInvoiceDto): Promise<CreateResponseDto<SupplierInvoiceResponseDto>> {
    this.logger.log('POST /commerce-api/le/supplier-invoices');
    return this.service.create(dto);
  }

  // Returns an invoice with its lines, flags and linked receipts
  @Get(':id')
  @RequirePermission(LE_SUPPLIER_INVOICES.view)
  @ApiFindSupplierInvoiceById()
  findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @OrgId() orgId: string,
    @LegalEntityId() legalEntityId: string | undefined,
  ): Promise<SupplierInvoiceDetailResponseDto> {
    this.logger.log(`GET /commerce-api/le/supplier-invoices/${id}`);
    return this.service.findById(id, orgId, legalEntityId);
  }

  // Updates an invoice's header
  @Patch(':id')
  @RequirePermission(LE_SUPPLIER_INVOICES.edit)
  @ApiUpdateSupplierInvoice()
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSupplierInvoiceDto,
    @LegalEntityId() legalEntityId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /commerce-api/le/supplier-invoices/${id}`);
    return this.service.update(id, dto, legalEntityId);
  }

  // Posts a draft invoice, setting the final cost of the stock it bills
  @Post(':id/post')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(LE_SUPPLIER_INVOICES.edit)
  @ApiPostSupplierInvoice()
  post(
    @Param('id', new ParseUUIDPipe()) id: string,
    @LegalEntityId() legalEntityId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`POST /commerce-api/le/supplier-invoices/${id}/post`);
    return this.service.post(id, legalEntityId);
  }

  // Cancels an invoice, reversing its costing when it was posted
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(LE_SUPPLIER_INVOICES.edit)
  @ApiCancelSupplierInvoice()
  cancel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @LegalEntityId() legalEntityId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`POST /commerce-api/le/supplier-invoices/${id}/cancel`);
    return this.service.cancel(id, legalEntityId);
  }

  // Deletes a draft invoice
  @Delete(':id')
  @RequirePermission(LE_SUPPLIER_INVOICES.delete)
  @ApiDeleteSupplierInvoice()
  delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /commerce-api/le/supplier-invoices/${id}`);
    return this.service.delete(id);
  }

  // Adds a billed line to an invoice
  @Post(':id/lines')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(LE_SUPPLIER_INVOICES.edit)
  @ApiCreateSupplierInvoiceLine()
  createLine(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SupplierInvoiceLineDto,
    @LegalEntityId() legalEntityId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`POST /commerce-api/le/supplier-invoices/${id}/lines`);
    return this.service.createLine(id, dto, legalEntityId);
  }

  // Updates a line of an invoice
  @Patch(':id/lines/:lineId')
  @RequirePermission(LE_SUPPLIER_INVOICES.edit)
  @ApiUpdateSupplierInvoiceLine()
  updateLine(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('lineId', new ParseUUIDPipe()) lineId: string,
    @Body() dto: SupplierInvoiceLineDto,
    @LegalEntityId() legalEntityId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /commerce-api/le/supplier-invoices/${id}/lines/${lineId}`);
    return this.service.updateLine(id, lineId, dto, legalEntityId);
  }

  // Removes a line from an invoice
  @Delete(':id/lines/:lineId')
  @RequirePermission(LE_SUPPLIER_INVOICES.edit)
  @ApiDeleteSupplierInvoiceLine()
  deleteLine(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('lineId', new ParseUUIDPipe()) lineId: string,
    @LegalEntityId() legalEntityId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /commerce-api/le/supplier-invoices/${id}/lines/${lineId}`);
    return this.service.deleteLine(id, lineId, legalEntityId);
  }
}
