import type { AppWebhookEndpointDto } from '@domain/app-webhook/dto/entity/app-webhook-endpoint.dto';
import type { UpsertAppWebhookEndpointInternalDto } from '@domain/app-webhook/dto/request/upsert-app-webhook-endpoint-internal.dto';
import type { WebhookDeliveriesPageResponseDto } from '@domain/app-webhook/dto/response/webhook-deliveries-page-response.dto';
import { AppWebhookEndpointDomainService } from '@domain/app-webhook/services/app-webhook-endpoint.service';
import { WebhookDeliveryDomainService } from '@domain/app-webhook/services/webhook-delivery.service';
import { Injectable } from '@nestjs/common';
import type { TablePageRequest } from '@vritti/api-sdk/data-table';
import { NotFoundException } from '@vritti/api-sdk/exceptions';
import type { SuccessResponseDto } from '@vritti/api-sdk/responses';
import type { App } from '@/db/schema';
import { AppDomainService } from '@/modules/domain/app/services/app.service';
import type { WebhookDeliveryRefResponseDto } from '../dto/response/webhook-delivery-ref-response.dto';
import type { WebhookPublicKeyResponseDto } from '../dto/response/webhook-public-key-response.dto';

@Injectable()
export class AppWebhookService {
  constructor(
    private readonly appService: AppDomainService,
    private readonly endpointService: AppWebhookEndpointDomainService,
    private readonly deliveryService: WebhookDeliveryDomainService,
  ) {}

  // The app's endpoint, or null when it has not registered one
  async findEndpoint(orgId: string, appId: string): Promise<AppWebhookEndpointDto | null> {
    await this.requireApp(orgId, appId);
    return this.endpointService.findByApp(orgId, appId);
  }

  // Registers or replaces the app's endpoint
  async upsertEndpoint(
    orgId: string,
    appId: string,
    dto: UpsertAppWebhookEndpointInternalDto,
  ): Promise<AppWebhookEndpointDto> {
    await this.requireApp(orgId, appId);
    return this.endpointService.upsert(orgId, appId, dto);
  }

  // Removes the app's endpoint
  async deleteEndpoint(orgId: string, appId: string): Promise<SuccessResponseDto> {
    const app = await this.requireApp(orgId, appId);
    await this.endpointService.delete(orgId, appId);
    return { success: true, message: `Webhook endpoint of "${app.name}" deleted successfully.` };
  }

  // Queues a test event to the app's endpoint
  async sendTest(orgId: string, appId: string): Promise<WebhookDeliveryRefResponseDto> {
    await this.requireApp(orgId, appId);
    return this.deliveryService.enqueueTest(orgId, appId);
  }

  // Resolves one page of the app's deliveries from the page request cloud sends
  async findDeliveriesForTable(
    orgId: string,
    appId: string,
    page: TablePageRequest,
  ): Promise<WebhookDeliveriesPageResponseDto> {
    await this.requireApp(orgId, appId);
    return this.deliveryService.findForTable(orgId, appId, page);
  }

  // Requeues one delivery for an immediate attempt
  async redeliver(orgId: string, appId: string, deliveryId: string): Promise<WebhookDeliveryRefResponseDto> {
    await this.requireApp(orgId, appId);
    return this.deliveryService.redeliver(orgId, appId, deliveryId);
  }

  // The public key a receiver verifies deliveries with
  async findPublicKey(orgId: string, appId: string): Promise<WebhookPublicKeyResponseDto> {
    const app = await this.requireApp(orgId, appId);
    return { publicKey: app.signingPublicKey };
  }

  private async requireApp(orgId: string, appId: string): Promise<App> {
    const app = await this.appService.findInOrg(appId, orgId);
    if (!app) {
      throw new NotFoundException({
        label: 'App Not Found',
        detail: 'That app does not exist for this organization.',
      });
    }
    return app;
  }
}
