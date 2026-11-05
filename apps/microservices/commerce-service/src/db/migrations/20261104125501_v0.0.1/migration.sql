ALTER TABLE "commerce"."payment_term_lines" RENAME TO "payment_term_rules";--> statement-breakpoint
ALTER TABLE "commerce"."payment_term_rules" RENAME CONSTRAINT "payment_term_lines_percent_chk" TO "payment_term_rules_percent_chk";--> statement-breakpoint
ALTER TABLE "commerce"."payment_term_rules" RENAME CONSTRAINT "payment_term_lines_due_days_chk" TO "payment_term_rules_due_days_chk";--> statement-breakpoint
ALTER TABLE "commerce"."payment_term_rules" RENAME CONSTRAINT "payment_term_lines_discount_chk" TO "payment_term_rules_discount_chk";--> statement-breakpoint
ALTER TABLE "commerce"."payment_term_rules" RENAME CONSTRAINT "uq_payment_term_lines_term_due_days" TO "uq_payment_term_rules_term_due_days";