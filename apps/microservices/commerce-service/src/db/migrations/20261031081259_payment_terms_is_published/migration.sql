DROP INDEX "commerce"."idx_payment_terms_org_status";--> statement-breakpoint
ALTER TABLE "commerce"."payment_terms" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "commerce"."payment_terms" SET "is_published" = true WHERE "status" <> 'DRAFT';--> statement-breakpoint
ALTER TABLE "commerce"."payment_terms" DROP COLUMN "status";--> statement-breakpoint
CREATE INDEX "idx_payment_terms_org_published" ON "commerce"."payment_terms" ("organization_id","is_published");--> statement-breakpoint
DROP TYPE "commerce"."payment_term_status";