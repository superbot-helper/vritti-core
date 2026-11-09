-- checkout_status gains EXPIRED (before CANCELLED). Rebuilt rather than `ADD VALUE`: a value added that way cannot be
-- used until its transaction commits, and the checkouts the sweep already ended are moved to it in the same run.
ALTER TYPE "commerce"."checkout_status" RENAME TO "checkout_status_old";--> statement-breakpoint
CREATE TYPE "commerce"."checkout_status" AS ENUM('OPEN', 'PAID', 'CONVERTED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
-- The expiry sweep marked expired checkouts CANCELLED with this reason; they become EXPIRED
ALTER TABLE "commerce"."checkouts" ALTER COLUMN "status" TYPE "commerce"."checkout_status" USING (
  CASE
    WHEN "status"::text = 'CANCELLED' AND "cancellation_reason" = 'Checkout expired before it was paid.' THEN 'EXPIRED'
    ELSE "status"::text
  END
)::"commerce"."checkout_status";--> statement-breakpoint
ALTER TABLE "commerce"."checkouts" ALTER COLUMN "status" SET DEFAULT 'OPEN';--> statement-breakpoint
UPDATE "commerce"."checkouts" SET "cancelled_at" = NULL, "cancellation_reason" = NULL WHERE "status" = 'EXPIRED';--> statement-breakpoint
DROP TYPE "commerce"."checkout_status_old";
