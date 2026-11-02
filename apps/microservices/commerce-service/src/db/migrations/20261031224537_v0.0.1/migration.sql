ALTER TABLE "commerce"."supplier_sites" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_sites" ADD COLUMN "purchasing_blocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_sites" ADD COLUMN "payment_blocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_sites" ADD COLUMN "is_supplier_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_sites" ADD COLUMN "is_supplier_purchasing_blocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_sites" ADD COLUMN "is_supplier_payment_blocked" boolean DEFAULT false NOT NULL;