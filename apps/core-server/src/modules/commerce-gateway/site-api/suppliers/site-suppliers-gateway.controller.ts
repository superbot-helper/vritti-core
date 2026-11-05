import { CreateSupplierEnrollmentDto } from '@commerce/supplier-enrollments/dto/request/create-supplier-enrollment.dto';
import { SetSupplierEnrollmentActiveDto } from '@commerce/supplier-enrollments/dto/request/set-supplier-enrollment-active.dto';
import { UpdateSupplierEnrollmentDto } from '@commerce/supplier-enrollments/dto/request/update-supplier-enrollment.dto';
import type { SupplierEnrollmentDetailResponseDto } from '@commerce/supplier-enrollments/dto/response/supplier-enrollment-detail-response.dto';
import type { SupplierEnrollmentResponseDto } from '@commerce/supplier-enrollments/dto/response/supplier-enrollment-response.dto';
import type { SupplierEnrollmentTableResponseDto } from '@commerce/supplier-enrollments/dto/response/supplier-enrollment-table-response.dto';
import { UpdateSupplierSiteItemDto } from '@commerce/supplier-items/dto/request/update-supplier-site-item.dto';
import type { SupplierSiteItemRowResponseDto } from '@commerce/supplier-items/dto/response/supplier-site-item-row-response.dto';
import type { SupplierSiteItemRowTableResponseDto } from '@commerce/supplier-items/dto/response/supplier-site-item-row-table-response.dto';
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
import { SITE_SUPPLIERS } from '@vritti/commerce-permissions/suppliers';
import { SessionTypeValues } from '@/db/schema';
import { RequireFeature, RequirePermission } from '@/rbac/decorators';
import { OrgId, SiteId } from '@/security/decorators';
import { SiteSuppliersGatewayService } from './services/site-suppliers-gateway.service';

@ApiTags('Commerce - Site Suppliers')
@ApiBearerAuth()
@Require(AuthType.Session, SessionTypeValues.WEB)
@RequireFeature(SITE_SUPPLIERS.featureCode)
@Controller('site/suppliers')
export class SiteSuppliersGatewayController {
  private readonly logger = new Logger(SiteSuppliersGatewayController.name);

  constructor(private readonly siteSuppliersGatewayService: SiteSuppliersGatewayService) {}

  // Returns every supplier of the legal entity with its enrollment at the session site, with server-stored state
  @Get('table')
  @RequirePermission(SITE_SUPPLIERS.view)
  getSupplierTable(@UserId() userId: string, @OrgId() orgId: string): Promise<SupplierEnrollmentTableResponseDto> {
    this.logger.log('GET /commerce-api/site/suppliers/table');
    return this.siteSuppliersGatewayService.findForTable(userId, orgId);
  }

  // Enrolls a supplier at the session site
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(SITE_SUPPLIERS.enroll)
  create(
    @Body() dto: CreateSupplierEnrollmentDto,
    @SiteId() siteId: string | undefined,
  ): Promise<CreateResponseDto<SupplierEnrollmentResponseDto>> {
    this.logger.log('POST /commerce-api/site/suppliers');
    return this.siteSuppliersGatewayService.create(dto, siteId);
  }

  // Returns a supplier's enrollment at the session site with its commercial identity, enrolled or not
  @Get(':id')
  @RequirePermission(SITE_SUPPLIERS.view)
  findById(
    @Param('id', new ParseUUIDPipe()) supplierId: string,
    @OrgId() orgId: string,
  ): Promise<SupplierEnrollmentDetailResponseDto> {
    this.logger.log(`GET /commerce-api/site/suppliers/${supplierId}`);
    return this.siteSuppliersGatewayService.findById(supplierId, orgId);
  }

  // Updates a supplier's enrollment picks and flags at the session site
  @Patch(':id')
  @RequirePermission(SITE_SUPPLIERS.editEnroll)
  update(
    @Param('id', new ParseUUIDPipe()) supplierId: string,
    @Body() dto: UpdateSupplierEnrollmentDto,
    @SiteId() siteId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /commerce-api/site/suppliers/${supplierId}`);
    return this.siteSuppliersGatewayService.update(supplierId, dto, siteId);
  }

  // Activates or deactivates a supplier's own enrollment at the session site
  @Patch(':id/active')
  @RequirePermission(SITE_SUPPLIERS.editEnroll)
  setActive(
    @Param('id', new ParseUUIDPipe()) supplierId: string,
    @Body() dto: SetSupplierEnrollmentActiveDto,
    @SiteId() siteId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /commerce-api/site/suppliers/${supplierId}/active`);
    return this.siteSuppliersGatewayService.setActive(supplierId, dto.isActive, siteId);
  }

  // Removes a supplier's enrollment at the session site
  @Delete(':id')
  @RequirePermission(SITE_SUPPLIERS.unenroll)
  delete(@Param('id', new ParseUUIDPipe()) supplierId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /commerce-api/site/suppliers/${supplierId}`);
    return this.siteSuppliersGatewayService.delete(supplierId);
  }

  // Returns an enrolled supplier's site items at this site for the data table
  @Get(':id/site-items/table')
  @RequirePermission(SITE_SUPPLIERS.siteItems.view)
  getSiteItemsTable(
    @Param('id') supplierId: string,
    @UserId() userId: string,
  ): Promise<SupplierSiteItemRowTableResponseDto> {
    this.logger.log(`GET /commerce-api/site/suppliers/${supplierId}/site-items/table`);
    return this.siteSuppliersGatewayService.findSiteItemsTable(supplierId, userId);
  }

  // Returns a supplier item's detail with this site's terms and price in force
  @Get(':id/site-items/:itemId')
  @RequirePermission(SITE_SUPPLIERS.siteItems.view)
  findSiteItemById(
    @Param('id') supplierId: string,
    @Param('itemId') itemId: string,
  ): Promise<SupplierSiteItemRowResponseDto> {
    this.logger.log(`GET /commerce-api/site/suppliers/${supplierId}/site-items/${itemId}`);
    return this.siteSuppliersGatewayService.findSiteItemById(itemId);
  }

  // Updates this site's terms for a supplier item; the site item must belong to this site (RLS)
  @Patch(':id/site-items/:siteItemId')
  @RequirePermission(SITE_SUPPLIERS.siteItems.terms.edit)
  updateSiteItem(
    @Param('id') supplierId: string,
    @Param('siteItemId') supplierSiteItemId: string,
    @Body() dto: UpdateSupplierSiteItemDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /commerce-api/site/suppliers/${supplierId}/site-items/${supplierSiteItemId}`);
    return this.siteSuppliersGatewayService.updateSiteItem(supplierSiteItemId, dto);
  }
}
