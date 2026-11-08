import { CreateTaxRegistrationDto } from '@commerce/tax-registrations/dto/request/create-tax-registration.dto';
import { UpdateTaxRegistrationDto } from '@commerce/tax-registrations/dto/request/update-tax-registration.dto';
import type { TaxRegistrationResponseDto } from '@commerce/tax-registrations/dto/response/tax-registration-response.dto';
import type { TaxRegistrationsPageResponseDto } from '@commerce/tax-registrations/dto/response/tax-registrations-page-response.dto';
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
import { ApiTags } from '@nestjs/swagger';
import { AuthType, Require } from '@vritti/api-sdk/auth';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { InternalTablePageDto } from '@/common/dto/request/internal-table-page.dto';
import { TaxRegistrationsGatewayService } from '@/modules/commerce-gateway/le-api/tax-registrations/services/tax-registrations-gateway.service';
import { ApiTableByLegalEntityTaxRegistrationsInternal } from './docs/tax-registration-internal.docs';

// The cloud-facing surface.
@ApiTags('Internal - Tax Registrations')
@Require(AuthType.Cloud)
@Controller('tax-registrations/internal')
export class TaxRegistrationInternalController {
  private readonly logger = new Logger(TaxRegistrationInternalController.name);

  constructor(private readonly service: TaxRegistrationsGatewayService) {}

  // Cloud's data table for one legal entity: it holds the view state and sends it serialized, core resolves the page
  @Post('legal-entity/:legalEntityId/table')
  @HttpCode(HttpStatus.OK)
  @ApiTableByLegalEntityTaxRegistrationsInternal()
  tableByLegalEntity(
    @Param('legalEntityId', ParseUUIDPipe) legalEntityId: string,
    @Body() page: InternalTablePageDto,
  ): Promise<TaxRegistrationsPageResponseDto> {
    this.logger.log(`POST /tax-registrations/internal/legal-entity/${legalEntityId}/table`);
    return this.service.findForTablePage(legalEntityId, page);
  }

  @Get('legal-entity/:legalEntityId')
  list(@Param('legalEntityId') legalEntityId: string): Promise<TaxRegistrationResponseDto[]> {
    this.logger.log(`GET /tax-registrations/internal/legal-entity/${legalEntityId}`);
    return this.service.listByLegalEntity(legalEntityId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTaxRegistrationDto): Promise<CreateResponseDto<TaxRegistrationResponseDto>> {
    this.logger.log(`POST /tax-registrations/internal — ${dto.registrationNumber}`);
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaxRegistrationDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /tax-registrations/internal/${id}`);
    return this.service.update(id, dto);
  }

  // Scoped to the legal entity so cloud can only remove a registration that entity actually owns
  @Delete('legal-entity/:legalEntityId/:id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('legalEntityId') legalEntityId: string, @Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /tax-registrations/internal/legal-entity/${legalEntityId}/${id}`);
    return this.service.deleteForLegalEntity(legalEntityId, id);
  }
}
