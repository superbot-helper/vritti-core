ALTER TABLE "commerce"."checkouts" DROP CONSTRAINT "uq_checkouts_party_key";--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ADD COLUMN "replaced_by_checkout_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_checkouts_one_open_per_party" ON "commerce"."checkouts" ("organization_id","party_id") WHERE status = 'OPEN';--> statement-breakpoint
CREATE INDEX "idx_checkouts_party_key" ON "commerce"."checkouts" ("organization_id","party_id","checkout_key");--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ADD CONSTRAINT "checkouts_replaced_by_checkout_id_checkouts_id_fkey" FOREIGN KEY ("replaced_by_checkout_id") REFERENCES "commerce"."checkouts"("id") ON DELETE SET NULL;