import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, getColumns, ne, type SQL, sql, sum } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { type PaymentTerm, paymentTermRules, paymentTerms, supplierEnrollments, suppliers } from '@/db/schema';

export type PaymentTermDetail = PaymentTerm & {
  ruleCount: number;
  totalPercent: string;
  supplierCount: number;
  enrollmentCount: number;
};

@Injectable()
export class PaymentTermsDomainRepository extends PrimaryBaseRepository<typeof paymentTerms> {
  constructor(database: PrimaryDatabaseService) {
    super(database, paymentTerms);
  }

  async findByIdOrThrow(id: string): Promise<PaymentTerm> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('Payment term not found.');
    return entity;
  }

  async findDetailOrThrow(id: string): Promise<PaymentTermDetail> {
    const entity = await this.findById<PaymentTermDetail>(id, { select: this.selection() });
    if (!entity) throw new NotFoundException('Payment term not found.');
    return entity;
  }

  // A published term is in use or may be picked at any moment; unpublish it to edit
  async findDraftOrThrow(id: string): Promise<PaymentTerm> {
    const draft = await this.findById(id, { where: eq(paymentTerms.isPublished, false) });
    if (!draft) {
      throw new BadRequestException({
        label: 'Payment term is published',
        detail: 'Unpublish the payment term before editing it.',
      });
    }
    return draft;
  }

  // Names are unique per org regardless of case — they are what pickers show
  async assertNameFree(name: string, excludeId?: string): Promise<void> {
    const taken = await this.exists(
      and(
        sql`lower(${paymentTerms.name}) = lower(${name})`,
        excludeId ? ne(paymentTerms.id, excludeId) : undefined,
      ) as SQL,
    );
    if (!taken) return;
    throw new ConflictException({
      label: 'Name already used',
      detail: `A payment term named "${name}" already exists.`,
      errors: [{ field: 'name', message: 'Already used by another payment term' }],
    });
  }

  // Suppliers depend on a term they use as their default or on a site enrollment; the detail returns both counts
  assertNotInUse(term: PaymentTermDetail, action: 'delete' | 'unpublish'): void {
    if (term.supplierCount === 0 && term.enrollmentCount === 0) return;
    throw new ConflictException({
      label: 'Payment term in use',
      detail: `Suppliers use this payment term. Move them to another payment term before you ${action} it.`,
    });
  }

  private selection() {
    const ownRules = eq(paymentTermRules.paymentTermId, paymentTerms.id);
    return {
      ...getColumns(paymentTerms),
      ruleCount: this.db.$count(paymentTermRules, ownRules),
      totalPercent: sql<string>`(${this.db
        .select({ total: sql`coalesce(${sum(paymentTermRules.percent)}, 0)` })
        .from(paymentTermRules)
        .where(ownRules)})`,
      supplierCount: this.db.$count(suppliers, eq(suppliers.defaultPaymentTermId, paymentTerms.id)),
      enrollmentCount: this.db.$count(supplierEnrollments, eq(supplierEnrollments.paymentTermId, paymentTerms.id)),
    };
  }
}
