import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { type PaymentCheckoutMode, PaymentCheckoutModeValues } from '@/db/schema';

// Changes only how an own gateway's checkout opens; its keys and accounts stay as they are
export class UpdatePaymentGatewayCheckoutModeDto {
  @ApiProperty({
    description:
      "HOSTED opens the gateway's own page; MODAL opens its payment window on the store's page (razorpay, cashfree and easebuzz only)",
    enum: Object.values(PaymentCheckoutModeValues),
    example: 'MODAL',
  })
  @IsEnum(PaymentCheckoutModeValues)
  checkoutMode: PaymentCheckoutMode;
}
