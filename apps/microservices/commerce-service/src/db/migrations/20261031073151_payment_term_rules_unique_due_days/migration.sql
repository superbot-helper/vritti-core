DROP INDEX "commerce"."idx_payment_term_lines_term";--> statement-breakpoint
ALTER TABLE "commerce"."payment_term_lines" DROP COLUMN "sort_order";--> statement-breakpoint
ALTER TABLE "commerce"."payment_term_lines" ADD CONSTRAINT "uq_payment_term_lines_term_due_days" UNIQUE("payment_term_id","due_days");