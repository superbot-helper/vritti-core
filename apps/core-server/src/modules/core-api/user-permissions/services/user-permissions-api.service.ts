import { UserDomainService } from '@domain/user/services/user.service';
import { UserPermissionsDomainService } from '@domain/user-permissions/services/user-permissions.service';
import { Injectable } from '@nestjs/common';
import type { SelectOptionsQueryDto, SelectQueryResult } from '@vritti/api-sdk/select';

@Injectable()
export class UserPermissionsService {
  constructor(
    private readonly userService: UserDomainService,
    private readonly userPermissionsService: UserPermissionsDomainService,
  ) {}

  // Returns the sites the user can access as select options
  async getSitesSelect(userId: string, query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    const user = await this.userService.findByIdOrThrow(userId);
    return this.userPermissionsService.findAssignedSitesForSelect(userId, user.organizationId, query);
  }
}
