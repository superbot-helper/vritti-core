import Decimal from '@vritti/api-sdk/decimal';
import type { PaymentTerm, PaymentTermBaseline } from '@/db/schema';

export class PaymentTermDto {
  id: string;
  name: string;
  baseline: PaymentTermBaseline;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;

  static from(entity: PaymentTerm): PaymentTermDto {
    const dto = new PaymentTermDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.baseline = entity.baseline;
    dto.description = entity.description ?? null;
    dto.isPublished = entity.isPublished;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}

export class PaymentTermDetailDto extends PaymentTermDto {
  ruleCount: number;
  supplierCount: number;
  enrollmentCount: number;
  canPublish: boolean;
  canUnpublish: boolean;
  canDelete: boolean;

  static override from(
    entity: PaymentTerm & { ruleCount: number; totalPercent: string; supplierCount: number; enrollmentCount: number },
  ): PaymentTermDetailDto {
    const dto = Object.assign(new PaymentTermDetailDto(), PaymentTermDto.from(entity));
    const inUse = entity.supplierCount > 0 || entity.enrollmentCount > 0;
    dto.ruleCount = entity.ruleCount;
    dto.supplierCount = entity.supplierCount;
    dto.enrollmentCount = entity.enrollmentCount;
    dto.canPublish = !entity.isPublished && entity.ruleCount > 0 && new Decimal(entity.totalPercent).equals(100);
    dto.canUnpublish = entity.isPublished && !inUse;
    dto.canDelete = !inUse;
    return dto;
  }
}
