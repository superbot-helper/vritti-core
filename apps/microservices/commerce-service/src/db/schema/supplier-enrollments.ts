import { sql } from '@vritti/api-sdk/drizzle-orm';
import { boolean, foreignKey, index, timestamp, unique, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { commerceSchema } from './commerce-schema';
import { partyBankAccounts, partyCommunications, partyRelationships, partyTaxRegistrations } from './parties';
import { paymentTerms } from './payment-terms';
import { suppliers } from './suppliers';
import { organizationIdColumn, siteDocumentPolicies } from './workspace-scope';

export const supplierEnrollments = commerceSchema.table(
  'supplier_enrollments',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    organizationId: organizationIdColumn,
    legalEntityId: uuid('legal_entity_id').notNull().default(sql.raw("cast(current_setting('app.le_id') as uuid)")),
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    siteId: uuid('site_id').notNull(),
    partyTaxRegistrationId: uuid('party_tax_registration_id'),
    partyBankAccountId: uuid('party_bank_account_id'),
    orderRelationshipId: uuid('order_relationship_id'),
    orderEmailCommunicationId: uuid('order_email_communication_id').notNull(),
    orderPhoneCommunicationId: uuid('order_phone_communication_id').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    isSupplierActive: boolean('is_supplier_active').notNull().default(true),
    paymentTermId: uuid('payment_term_id')
      .notNull()
      .references(() => paymentTerms.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('uq_supplier_enrollments').on(table.supplierId, table.siteId),
    index('idx_supplier_enrollments_supplier').on(table.supplierId),
    index('idx_supplier_enrollments_site').on(table.siteId),
    foreignKey({
      columns: [table.partyTaxRegistrationId],
      foreignColumns: [partyTaxRegistrations.id],
      name: 'fk_supplier_enrollments_tax_registration',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.partyBankAccountId],
      foreignColumns: [partyBankAccounts.id],
      name: 'fk_supplier_enrollments_bank_account',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.orderRelationshipId],
      foreignColumns: [partyRelationships.id],
      name: 'fk_supplier_enrollments_order_relationship',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.orderEmailCommunicationId],
      foreignColumns: [partyCommunications.id],
      name: 'fk_supplier_enrollments_order_email',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.orderPhoneCommunicationId],
      foreignColumns: [partyCommunications.id],
      name: 'fk_supplier_enrollments_order_phone',
    }).onDelete('restrict'),
    ...siteDocumentPolicies(),
  ],
);

export type SupplierEnrollment = typeof supplierEnrollments.$inferSelect;
export type NewSupplierEnrollment = typeof supplierEnrollments.$inferInsert;
