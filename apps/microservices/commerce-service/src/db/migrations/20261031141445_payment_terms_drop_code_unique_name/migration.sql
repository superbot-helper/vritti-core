ALTER TABLE "commerce"."payment_terms" DROP CONSTRAINT "uq_payment_terms_org_code";--> statement-breakpoint
ALTER TABLE "commerce"."payment_terms" DROP CONSTRAINT "payment_terms_code_chk";--> statement-breakpoint
ALTER TABLE "commerce"."payment_terms" DROP COLUMN "code";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payment_terms_org_name" ON "commerce"."payment_terms" ("organization_id",lower("name"));