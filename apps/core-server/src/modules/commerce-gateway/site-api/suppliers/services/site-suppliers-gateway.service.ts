import type { CreateSupplierEnrollmentDto } from '@commerce/supplier-enrollments/dto/request/create-supplier-enrollment.dto';
import type { UpdateSupplierEnrollmentDto } from '@commerce/supplier-enrollments/dto/request/update-supplier-enrollment.dto';
import type { SupplierEnrollmentDetailResponseDto } from '@commerce/supplier-enrollments/dto/response/supplier-enrollment-detail-response.dto';
import type { SupplierEnrollmentResponseDto } from '@commerce/supplier-enrollments/dto/response/supplier-enrollment-response.dto';
import type { SupplierEnrollmentRowResponseDto } from '@commerce/supplier-enrollments/dto/response/supplier-enrollment-row-response.dto';
import type { SupplierEnrollmentTableResponseDto } from '@commerce/supplier-enrollments/dto/response/supplier-enrollment-table-response.dto';
import type { UpdateSupplierSiteItemDto } from '@commerce/supplier-items/dto/request/update-supplier-site-item.dto';
import type { SupplierSiteItemRowResponseDto } from '@commerce/supplier-items/dto/response/supplier-site-item-row-response.dto';
import type { SupplierSiteItemRowTableResponseDto } from '@commerce/supplier-items/dto/response/supplier-site-item-row-table-response.dto';
import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import { NatsClientService } from '@vritti/api-sdk/nats';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { OwnerNameService } from '@/owner-names/owner-name.service';

@Injectable()
export class SiteSuppliersGatewayService {
  private readonly logger = new Logger(SiteSuppliersGatewayService.name);

  constructor(
    private readonly nats: NatsClientService,
    private readonly dataTableStateService: DataTableStateService,
    private readonly ownerNames: OwnerNameService,
  ) {}

  // Returns the legal entity's suppliers with their enrollment at this site for the data table, named by core
  async findForTable(userId: string, orgId: string): Promise<SupplierEnrollmentTableResponseDto> {
    this.logger.log('site.suppliers.table');
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'commerce-site-suppliers');

    const { result, count } = await this.nats.send<{ result: SupplierEnrollmentRowResponseDto[]; count: number }>(
      'commerce',
      'site.suppliers.table',
      state,
    );

    return { result: await this.ownerNames.withSiteNames(orgId, result), count, state, activeViewId };
  }

  // Enrolls a supplier at the session site
  async create(
    dto: CreateSupplierEnrollmentDto,
    siteId: string | undefined,
  ): Promise<CreateResponseDto<SupplierEnrollmentResponseDto>> {
    this.logger.log(`site.suppliers.create — supplierId: ${dto.supplierId}`);
    return this.nats.send('commerce', 'site.suppliers.create', { ...dto, siteId });
  }

  // Returns a supplier's enrollment at the session site, enrolled or not, with the site's name
  async findById(supplierId: string, orgId: string): Promise<SupplierEnrollmentDetailResponseDto> {
    this.logger.log(`site.suppliers.findById — supplierId: ${supplierId}`);
    const row = await this.nats.send<SupplierEnrollmentDetailResponseDto>('commerce', 'site.suppliers.findById', {
      supplierId,
    });
    const [enriched] = await this.ownerNames.withSiteNames(orgId, [row]);
    return enriched;
  }

  // Updates a supplier's enrollment picks and flags at the session site
  async update(
    supplierId: string,
    dto: UpdateSupplierEnrollmentDto,
    siteId: string | undefined,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`site.suppliers.update — supplierId: ${supplierId}`);
    return this.nats.send('commerce', 'site.suppliers.update', { ...dto, supplierId, siteId });
  }

  // Activates or deactivates a supplier's own enrollment at the session site
  async setActive(supplierId: string, isActive: boolean, siteId: string | undefined): Promise<SuccessResponseDto> {
    this.logger.log(`site.suppliers.setActive — supplierId: ${supplierId}, isActive: ${isActive}`);
    return this.nats.send('commerce', 'site.suppliers.setActive', { supplierId, siteId, isActive });
  }

  // Removes a supplier's enrollment at the session site
  async delete(supplierId: string): Promise<SuccessResponseDto> {
    this.logger.log(`site.suppliers.delete — supplierId: ${supplierId}`);
    return this.nats.send('commerce', 'site.suppliers.delete', { supplierId });
  }

  // Returns an enrolled supplier's site items at this site for the data table
  async findSiteItemsTable(supplierId: string, userId: string): Promise<SupplierSiteItemRowTableResponseDto> {
    this.logger.log(`site.suppliers.siteItems.table — supplierId: ${supplierId}`);
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `commerce-site-supplier-${supplierId}-site-items`,
    );

    const { result, count } = await this.nats.send<{ result: SupplierSiteItemRowResponseDto[]; count: number }>(
      'commerce',
      'site.suppliers.siteItems.table',
      { supplierId, ...state },
    );

    return { result, count, state, activeViewId };
  }

  // Returns a supplier item's detail with this site's terms and price in force
  async findSiteItemById(supplierItemId: string): Promise<SupplierSiteItemRowResponseDto> {
    this.logger.log(`site.suppliers.siteItems.findById — supplierItemId: ${supplierItemId}`);
    return this.nats.send('commerce', 'site.suppliers.siteItems.findById', { supplierItemId });
  }

  // Updates this site's terms for a supplier item (preferred, lead time)
  async updateSiteItem(supplierSiteItemId: string, dto: UpdateSupplierSiteItemDto): Promise<SuccessResponseDto> {
    this.logger.log(`site.suppliers.siteItems.update — id: ${supplierSiteItemId}`);
    return this.nats.send('commerce', 'site.suppliers.siteItems.update', { id: supplierSiteItemId, ...dto });
  }
}
