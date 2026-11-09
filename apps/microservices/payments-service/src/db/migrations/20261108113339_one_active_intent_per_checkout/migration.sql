-- Rule: a checkout has at most one active payment intent (CREATED, REQUIRES_ACTION or PROCESSING). Before the partial
-- unique index arrives, every checkout's older active intents still waiting on the shopper are cancelled, keeping the
-- newest. One PROCESSING (the gateway is confirming money) is never touched here: if a checkout has one, its waiting
-- intents are the ones cancelled
UPDATE "payments"."payment_intents" AS i
SET "status" = 'CANCELED', "updated_at" = now()
WHERE i."checkout_id" IS NOT NULL
  AND i."status" IN ('CREATED', 'REQUIRES_ACTION')
  AND EXISTS (
    SELECT 1
    FROM "payments"."payment_intents" AS n
    WHERE n."organization_id" = i."organization_id"
      AND n."checkout_id" = i."checkout_id"
      AND n."id" <> i."id"
      AND (
        n."status" = 'PROCESSING'
        OR (
          n."status" IN ('CREATED', 'REQUIRES_ACTION')
          AND (n."created_at" > i."created_at" OR (n."created_at" = i."created_at" AND n."id" > i."id"))
        )
      )
  );
