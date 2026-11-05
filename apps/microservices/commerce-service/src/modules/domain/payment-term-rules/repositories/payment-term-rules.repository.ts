import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, or, type SQL } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { type NewPaymentTermRule, type PaymentTermRule, paymentTermRules } from '@/db/schema';
import type { PaymentTermRuleFieldsDto } from '../dto/request/payment-term-rule-fields.dto';

@Injectable()
export class PaymentTermRulesDomainRepository extends PrimaryBaseRepository<typeof paymentTermRules> {
  constructor(database: PrimaryDatabaseService) {
    super(database, paymentTermRules);
  }

  findByTerm(paymentTermId: string): Promise<PaymentTermRule[]> {
    return this.findMany({ where: { paymentTermId }, orderBy: { dueDays: 'asc' } });
  }

  // Each rule owns one due day; two rules on the same day are one rule split in two
  async assertDueDayFree(paymentTermId: string, dueDays: number): Promise<void> {
    if (await this.findOne({ paymentTermId, dueDays })) this.throwDueDayTaken(dueDays);
  }

  // One read for an edit: the rule itself and any other rule already on the due day it moves to
  async assertEditable(paymentTermId: string, id: string, dueDays: number): Promise<void> {
    const rows = await this.db
      .select({ id: paymentTermRules.id, dueDays: paymentTermRules.dueDays })
      .from(paymentTermRules)
      .where(
        and(
          eq(paymentTermRules.paymentTermId, paymentTermId),
          or(eq(paymentTermRules.id, id), eq(paymentTermRules.dueDays, dueDays)),
        ),
      );
    if (!rows.some((row) => row.id === id)) throw new NotFoundException('Rule not found.');
    if (rows.some((row) => row.id !== id && row.dueDays === dueDays)) this.throwDueDayTaken(dueDays);
  }

  // Deletes in one statement; nothing deleted means the rule is not on this term
  async deleteOrThrow(paymentTermId: string, id: string): Promise<void> {
    const { count } = await this.deleteMany(
      and(eq(paymentTermRules.id, id), eq(paymentTermRules.paymentTermId, paymentTermId)) as SQL,
    );
    if (count === 0) throw new NotFoundException('Rule not found.');
  }

  // A discount needs both its percentage and its window, and must be taken on or before the rule falls due
  assertValid(rule: PaymentTermRuleFieldsDto): void {
    const hasPercent = rule.discountPercent != null;
    const hasDays = rule.discountDays != null;
    if (hasPercent !== hasDays) {
      throw new BadRequestException({
        label: 'Incomplete discount',
        detail: 'An early-payment discount needs both a percentage and a number of days.',
        errors: [{ field: hasPercent ? 'discountDays' : 'discountPercent', message: 'Required' }],
      });
    }
    if (hasDays && (rule.discountDays ?? 0) > rule.dueDays) {
      throw new BadRequestException({
        label: 'Discount window too long',
        detail: 'The discount must be taken on or before the rule falls due.',
        errors: [{ field: 'discountDays', message: 'Must not exceed the due days' }],
      });
    }
  }

  async addRule(paymentTermId: string, rule: PaymentTermRuleFieldsDto): Promise<void> {
    await this.create({ ...this.toValues(rule), paymentTermId } as NewPaymentTermRule);
  }

  async updateRule(id: string, rule: PaymentTermRuleFieldsDto): Promise<void> {
    await this.update(id, this.toValues(rule));
  }

  private throwDueDayTaken(dueDays: number): never {
    throw new ConflictException({
      label: 'Due day already used',
      detail: `Another rule already falls due on day ${dueDays}. Edit that rule's share instead.`,
      errors: [{ field: 'dueDays', message: 'Already used by another rule' }],
    });
  }

  private toValues(
    rule: PaymentTermRuleFieldsDto,
  ): Pick<NewPaymentTermRule, 'percent' | 'dueDays' | 'discountPercent' | 'discountDays'> {
    return {
      percent: rule.percent,
      dueDays: rule.dueDays,
      discountPercent: rule.discountPercent ?? null,
      discountDays: rule.discountDays ?? null,
    };
  }
}
