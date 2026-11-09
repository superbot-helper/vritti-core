import type { CheckoutStartedDto, CheckoutStatusDto } from '@domain/checkouts/dto/entity/checkout.dto';
import {
  CancelCheckoutDto,
  ChangeCheckoutAddressDto,
  ChangeCheckoutContactDto,
  CheckoutRefDto,
  CompleteCheckoutDto,
  ExpireStaleCheckoutsDto,
  FindOpenCheckoutDto,
  StartCheckoutDto,
} from '@domain/checkouts/dto/request/checkout-request.dto';
import { CheckoutsDomainService } from '@domain/checkouts/services/checkouts.service';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { type NatsHeaders, RpcNatsHeaders } from '@vritti/api-sdk/nats';

// A checkout reaches across stores, so it lives at the organization; each store's cart is read under its own scope
@Controller()
export class CheckoutsController {
  private readonly logger = new Logger(CheckoutsController.name);

  constructor(private readonly service: CheckoutsDomainService) {}

  // Freezes the shopper's carts at the chosen stores into one checkout; payment intents are opened for it separately
  @MessagePattern({ cmd: 'org.checkouts.start' })
  start(@Payload() dto: StartCheckoutDto, @RpcNatsHeaders() headers: NatsHeaders): Promise<CheckoutStartedDto> {
    this.logger.log(`org.checkouts.start — party: ${dto.partyId}`);
    return this.service.start(dto, headers);
  }

  // Expires open checkouts whose window closed unpaid
  @MessagePattern({ cmd: 'org.checkouts.expireStale' })
  expireStale(@Payload() dto: ExpireStaleCheckoutsDto): Promise<{ cancelled: number }> {
    return this.service.expireStale(dto.limit);
  }

  // Records the captured payment and makes one paid order per store
  @MessagePattern({ cmd: 'org.checkouts.complete' })
  complete(@Payload() dto: CompleteCheckoutDto): Promise<CheckoutStatusDto> {
    this.logger.log(`org.checkouts.complete — checkout: ${dto.checkoutId}, intent: ${dto.paymentIntentId}`);
    return this.service.complete(dto);
  }

  // Abandons an unpaid checkout
  @MessagePattern({ cmd: 'org.checkouts.cancel' })
  cancel(@Payload() dto: CancelCheckoutDto): Promise<CheckoutStatusDto> {
    this.logger.log(`org.checkouts.cancel — checkout: ${dto.checkoutId}`);
    return this.service.cancel(dto);
  }

  // Delivers an open checkout to another of the party's saved addresses
  @MessagePattern({ cmd: 'org.checkouts.changeAddress' })
  changeAddress(@Payload() dto: ChangeCheckoutAddressDto): Promise<CheckoutStatusDto> {
    this.logger.log(`org.checkouts.changeAddress — checkout: ${dto.checkoutId}`);
    return this.service.changeAddress(dto);
  }

  // Changes who an open checkout's orders are for — the contact it holds, not the party's profile
  @MessagePattern({ cmd: 'org.checkouts.changeContact' })
  changeContact(@Payload() dto: ChangeCheckoutContactDto): Promise<CheckoutStatusDto> {
    this.logger.log(`org.checkouts.changeContact — checkout: ${dto.checkoutId}`);
    return this.service.changeContact(dto);
  }

  // The party's open checkout, if any — at most one
  @MessagePattern({ cmd: 'org.checkouts.findOpen' })
  findOpen(@Payload() dto: FindOpenCheckoutDto): Promise<{ checkout: CheckoutStatusDto | null }> {
    this.logger.log(`org.checkouts.findOpen — party: ${dto.partyId}`);
    return this.service.findOpen(dto);
  }

  // Where a checkout stands, with the orders it has become
  @MessagePattern({ cmd: 'org.checkouts.get' })
  get(@Payload() dto: CheckoutRefDto): Promise<CheckoutStatusDto> {
    this.logger.log(`org.checkouts.get — checkout: ${dto.checkoutId}`);
    return this.service.get(dto.checkoutId, dto.partyId);
  }
}
