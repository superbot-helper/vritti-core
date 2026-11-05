ALTER TABLE "commerce"."supplier_enrollments" DROP COLUMN "purchasing_blocked";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" DROP COLUMN "payment_blocked";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" DROP COLUMN "is_supplier_purchasing_blocked";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_enrollments" DROP COLUMN "is_supplier_payment_blocked";