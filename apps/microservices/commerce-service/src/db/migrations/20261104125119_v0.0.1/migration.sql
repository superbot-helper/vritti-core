ALTER TABLE "commerce"."checkouts" ADD COLUMN "party_address_id" uuid;--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ADD COLUMN "access_token_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ADD COLUMN "return_url" varchar(2048);--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ADD COLUMN "store_url" varchar(2048);--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ALTER COLUMN "gateway_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ADD CONSTRAINT "uq_checkouts_access_token" UNIQUE("access_token_hash");--> statement-breakpoint
CREATE INDEX "idx_checkouts_open_expiry" ON "commerce"."checkouts" ("status","expires_at");--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ADD CONSTRAINT "checkouts_party_address_id_party_addresses_id_fkey" FOREIGN KEY ("party_address_id") REFERENCES "commerce"."party_addresses"("id") ON DELETE SET NULL;