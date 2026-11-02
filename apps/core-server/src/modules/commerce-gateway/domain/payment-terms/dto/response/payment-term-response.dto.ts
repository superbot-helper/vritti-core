import { ApiProperty } from '@nestjs/swagger';

export const PAYMENT_TERM_BASELINES = ['INVOICE_DATE', 'GOODS_RECEIPT_DATE', 'END_OF_MONTH'] as const;
export type PaymentTermBaseline = (typeof PAYMENT_TERM_BASELINES)[number];

export class PaymentTermRuleResponseDto {
  @ApiProperty({ description: 'Rule ID' })
  id: string;

  @ApiProperty({ description: 'Share of the invoice this rule makes due', example: 100 })
  percent: number;

  @ApiProperty({ description: 'Days after the baseline date the rule falls due; unique within the term', example: 30 })
  dueDays: number;

  @ApiProperty({ description: 'Early-payment discount percentage', type: Number, nullable: true })
  discountPercent: number | null;

  @ApiProperty({ description: 'Days the discount stays available', type: Number, nullable: true })
  discountDays: number | null;
}

export class PaymentTermResponseDto {
  @ApiProperty({ description: 'Payment term ID' })
  id: string;

  @ApiProperty({ description: 'Human-readable name', example: 'Net 30' })
  name: string;

  @ApiProperty({ description: 'Date the due days count from', enum: PAYMENT_TERM_BASELINES })
  baseline: PaymentTermBaseline;

  @ApiProperty({ description: 'Internal description', type: String, nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Published terms can be picked; only a draft can be edited', example: true })
  isPublished: boolean;

  @ApiProperty({ description: 'ISO timestamp of creation' })
  createdAt: string;

  @ApiProperty({ description: 'ISO timestamp of last update' })
  updatedAt: string;
}

export class PaymentTermDetailResponseDto extends PaymentTermResponseDto {
  @ApiProperty({ description: 'Number of rules on the term', example: 2 })
  ruleCount: number;

  @ApiProperty({ description: 'Number of suppliers with this as their default payment term', example: 2 })
  supplierCount: number;

  @ApiProperty({ description: 'Number of supplier site enrollments on this payment term', example: 3 })
  enrollmentCount: number;

  @ApiProperty({ description: 'Whether the term is a draft whose rules total exactly 100%', example: true })
  canPublish: boolean;

  @ApiProperty({ description: 'Whether the term is published and no supplier uses it', example: false })
  canUnpublish: boolean;

  @ApiProperty({ description: 'Whether no supplier uses the term as a default or on a site enrollment', example: true })
  canDelete: boolean;
}

export class PaymentTermRulesResponseDto {
  @ApiProperty({ description: 'Sum of the rule percentages; must be 100 to activate', example: 100 })
  totalPercent: number;

  @ApiProperty({ type: [PaymentTermRuleResponseDto], description: 'Rules in due order' })
  rules: PaymentTermRuleResponseDto[];
}
