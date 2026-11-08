ALTER TABLE "commerce"."purchase_orders" ALTER COLUMN "exchange_rate" SET DEFAULT '1';--> statement-breakpoint
ALTER TABLE "commerce"."purchase_orders" ALTER COLUMN "exchange_rate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoices" ALTER COLUMN "exchange_rate" SET DEFAULT '1';--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoices" ALTER COLUMN "exchange_rate" SET NOT NULL;