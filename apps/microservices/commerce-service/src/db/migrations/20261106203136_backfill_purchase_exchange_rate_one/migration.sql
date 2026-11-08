-- Custom SQL migration file, put your code below! --
UPDATE "commerce"."purchase_orders" SET "exchange_rate" = 1 WHERE "exchange_rate" IS NULL;
--> statement-breakpoint
UPDATE "commerce"."supplier_invoices" SET "exchange_rate" = 1 WHERE "exchange_rate" IS NULL;
