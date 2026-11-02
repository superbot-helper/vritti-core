ALTER TABLE "commerce"."suppliers" DROP COLUMN "order_email";--> statement-breakpoint
ALTER TABLE "commerce"."suppliers" DROP COLUMN "order_phone";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_sites" ALTER COLUMN "order_email_communication_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_sites" ALTER COLUMN "order_phone_communication_id" SET NOT NULL;