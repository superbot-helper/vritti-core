import Decimal from '@vritti/api-sdk/decimal';
import type { PaymentTermRule } from '@/db/schema';

export class PaymentTermRuleDto {
  id: string;
  percent: number;
  dueDays: number;
  discountPercent: number | null;
  discountDays: number | null;

  static from(entity: PaymentTermRule): PaymentTermRuleDto {
    const dto = new PaymentTermRuleDto();
    dto.id = entity.id;
    dto.percent = Number(entity.percent);
    dto.dueDays = entity.dueDays;
    dto.discountPercent = entity.discountPercent == null ? null : Number(entity.discountPercent);
    dto.discountDays = entity.discountDays ?? null;
    return dto;
  }
}

export class PaymentTermRulesDto {
  totalPercent: number;
  rules: PaymentTermRuleDto[];

  static from(rules: PaymentTermRule[]): PaymentTermRulesDto {
    const dto = new PaymentTermRulesDto();
    dto.rules = [...rules].sort((a, b) => a.dueDays - b.dueDays).map(PaymentTermRuleDto.from);
    dto.totalPercent = Number(dto.rules.reduce((sum, rule) => sum.plus(rule.percent), new Decimal(0)).toFixed(2));
    return dto;
  }
}
