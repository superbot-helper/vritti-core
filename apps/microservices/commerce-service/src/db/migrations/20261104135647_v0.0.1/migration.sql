ALTER TABLE "commerce"."supplier_sites" RENAME TO "supplier_enrollments";--> statement-breakpoint
ALTER INDEX "commerce"."idx_supplier_sites_supplier" RENAME TO "idx_supplier_enrollments_supplier";--> statement-breakpoint
ALTER INDEX "commerce"."idx_supplier_sites_site" RENAME TO "idx_supplier_enrollments_site";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" RENAME CONSTRAINT "fk_supplier_sites_tax_registration" TO "fk_supplier_enrollments_tax_registration";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" RENAME CONSTRAINT "fk_supplier_sites_bank_account" TO "fk_supplier_enrollments_bank_account";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" RENAME CONSTRAINT "fk_supplier_sites_order_relationship" TO "fk_supplier_enrollments_order_relationship";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" RENAME CONSTRAINT "fk_supplier_sites_order_email" TO "fk_supplier_enrollments_order_email";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" RENAME CONSTRAINT "fk_supplier_sites_order_phone" TO "fk_supplier_enrollments_order_phone";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" RENAME CONSTRAINT "uq_supplier_sites" TO "uq_supplier_enrollments";