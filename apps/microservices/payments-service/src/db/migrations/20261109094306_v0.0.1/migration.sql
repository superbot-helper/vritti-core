ALTER TABLE "payments"."payment_intents" RENAME COLUMN "checkout" TO "launch";--> statement-breakpoint
ALTER TABLE "payments"."payment_intents" RENAME COLUMN "checkout_url" TO "retry_url";