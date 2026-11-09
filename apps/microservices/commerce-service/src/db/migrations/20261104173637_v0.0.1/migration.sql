ALTER TABLE "commerce"."checkouts" DROP CONSTRAINT "uq_checkouts_payment_intent";--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" DROP CONSTRAINT "uq_checkouts_access_token";--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" DROP COLUMN "payment_intent_id";--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" DROP COLUMN "access_token_hash";--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" DROP COLUMN "return_url";--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" DROP COLUMN "store_url";--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" DROP COLUMN "gateway_code";--> statement-breakpoint
ALTER TABLE "commerce"."inventory_item_costs" ALTER COLUMN "distribution_method" SET DEFAULT 'BY_VALUE'::"commerce"."cost_distribution_method";--> statement-breakpoint
ALTER TABLE "commerce"."inventory_items" ALTER COLUMN "tracking" SET DEFAULT 'LOT'::"commerce"."inventory_tracking";--> statement-breakpoint
ALTER TABLE "commerce"."inventory_items" ALTER COLUMN "pick_strategy" SET DEFAULT 'NONE'::"commerce"."inventory_pick_strategy";