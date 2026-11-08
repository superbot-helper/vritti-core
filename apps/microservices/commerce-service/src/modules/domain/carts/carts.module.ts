import { Module } from '@nestjs/common';
import { CartItemsDomainRepository } from './repositories/cart-items.repository';
import { CartsDomainRepository } from './repositories/carts.repository';
import { CartsDomainService } from './services/carts.service';

@Module({
  providers: [CartsDomainService, CartsDomainRepository, CartItemsDomainRepository],
  exports: [CartsDomainService, CartsDomainRepository, CartItemsDomainRepository],
})
export class CartsDomainModule {}
