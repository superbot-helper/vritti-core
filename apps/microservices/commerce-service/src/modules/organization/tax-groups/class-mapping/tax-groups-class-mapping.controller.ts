import type { TaxClassMappingDto } from '@domain/tax-groups/dto/entity/tax-class-mapping.dto';
import { TaxClassGroupsDomainService } from '@domain/tax-groups/services/tax-class-groups.service';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { TableViewState } from '@vritti/api-sdk/data-table';

@Controller()
export class TaxGroupsClassMappingController {
  private readonly logger = new Logger(TaxGroupsClassMappingController.name);

  constructor(private readonly service: TaxClassGroupsDomainService) {}

  // Returns every active tax class with its group valid today in the country of the table context, unmapped classes
  // included
  @MessagePattern({ cmd: 'org.taxGroups.classMapping.table' })
  async table(@Payload() state: TableViewState): Promise<{ result: TaxClassMappingDto[]; count: number }> {
    this.logger.log('taxGroups.classMapping.table');
    return this.service.findMappingForTable(state);
  }
}
