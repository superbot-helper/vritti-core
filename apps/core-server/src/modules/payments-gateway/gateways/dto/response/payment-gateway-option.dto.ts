import { ApiProperty } from '@nestjs/swagger';

export class PaymentGatewayOptionDto {
  @ApiProperty({ example: 'razorpay' })
  code: string;

  @ApiProperty({
    description: 'The credential fields a config for this gateway must carry',
    example: ['key_id', 'key_secret'],
    type: [String],
  })
  credentialFields: string[];

  @ApiProperty({ description: 'Whether the gateway can split a collected payment to linked accounts', example: true })
  supportsSplit: boolean;

  @ApiProperty({
    description: 'The payment methods its page takes, in the order the hosted checkout page offers them',
    example: ['upi', 'card', 'netbanking', 'wallet'],
    type: [String],
  })
  methods: string[];

  @ApiProperty({
    description: "Whether the gateway's checkout can open as a popup on the store's page (checkout mode MODAL)",
    example: true,
  })
  supportsModalCheckout: boolean;
}
