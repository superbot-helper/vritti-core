import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserId } from '@vritti/api-sdk/auth';
import { SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk/select';
import { UserPermissionsService } from '../services/user-permissions-api.service';

@ApiTags('User Permissions')
@ApiBearerAuth()
@Controller('user-permissions')
export class UserPermissionsController {
  private readonly logger = new Logger(UserPermissionsController.name);

  constructor(private readonly userPermissionsApiService: UserPermissionsService) {}

  // Returns assigned sites in select dropdown format (site switcher); full sites + resolved features via SSE /auth/status
  @Get('sites/select')
  async getSitesSelect(@UserId() userId: string, @Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`GET /api/user-permissions/sites/select — user: ${userId}`);
    return this.userPermissionsApiService.getSitesSelect(userId, query);
  }
}
