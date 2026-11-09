ALTER TABLE "payments"."payment_intents" ADD COLUMN "checkout_id" uuid;--> statement-breakpoint
CREATE INDEX "idx_payment_intents_checkout" ON "payments"."payment_intents" ("organization_id","checkout_id");--> statement-breakpoint
-- Backfill: every existing checkout payment names its checkout in reference_id
UPDATE "payments"."payment_intents"
SET "checkout_id" = "reference_id"::uuid
WHERE "reference_type" = 'commerce.checkout'
  AND "checkout_id" IS NULL
  AND "reference_id" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
