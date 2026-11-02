INSERT INTO "commerce"."party_communications" ("organization_id", "party_id", "channel", "value", "is_primary", "is_active")
SELECT DISTINCT ON (s."party_id") p."organization_id", s."party_id", 'EMAIL', COALESCE(NULLIF(trim(s."order_email"), ''), 'test@order.com'), false, true
FROM "commerce"."suppliers" s
JOIN "commerce"."parties" p ON p."id" = s."party_id"
WHERE EXISTS (SELECT 1 FROM "commerce"."supplier_sites" ss WHERE ss."supplier_id" = s."id")
  AND NOT EXISTS (
    SELECT 1 FROM "commerce"."party_communications" pc
    WHERE pc."party_id" = s."party_id" AND pc."channel" = 'EMAIL' AND pc."is_active"
  )
ORDER BY s."party_id", (NULLIF(trim(s."order_email"), '') IS NULL)
ON CONFLICT ("party_id", "channel", "value") DO NOTHING;
--> statement-breakpoint
INSERT INTO "commerce"."party_communications" ("organization_id", "party_id", "channel", "value", "is_primary", "is_active")
SELECT DISTINCT ON (s."party_id") p."organization_id", s."party_id", 'PHONE', COALESCE(NULLIF(trim(s."order_phone"), ''), '123456789'), false, true
FROM "commerce"."suppliers" s
JOIN "commerce"."parties" p ON p."id" = s."party_id"
WHERE EXISTS (SELECT 1 FROM "commerce"."supplier_sites" ss WHERE ss."supplier_id" = s."id")
  AND NOT EXISTS (
    SELECT 1 FROM "commerce"."party_communications" pc
    WHERE pc."party_id" = s."party_id" AND pc."channel" = 'PHONE' AND pc."is_active"
  )
ORDER BY s."party_id", (NULLIF(trim(s."order_phone"), '') IS NULL)
ON CONFLICT ("party_id", "channel", "value") DO NOTHING;
--> statement-breakpoint
INSERT INTO "commerce"."party_functions" ("organization_id", "party_id", "function", "party_communication_id", "is_primary", "is_active")
SELECT pc."organization_id", pc."party_id", 'ORDERING', pc."id", false, true
FROM (
  SELECT DISTINCT ON (pc."party_id", pc."channel") pc.*
  FROM "commerce"."party_communications" pc
  WHERE pc."channel" IN ('EMAIL', 'PHONE')
    AND pc."is_active"
    AND pc."party_id" IN (
      SELECT s."party_id" FROM "commerce"."suppliers" s JOIN "commerce"."supplier_sites" ss ON ss."supplier_id" = s."id"
    )
  ORDER BY pc."party_id", pc."channel", pc."is_primary" DESC, pc."created_at"
) pc
ON CONFLICT ("party_communication_id", "function") DO NOTHING;
--> statement-breakpoint
UPDATE "commerce"."supplier_sites" ss
SET
  "order_email_communication_id" = COALESCE(ss."order_email_communication_id", (
    SELECT pc."id" FROM "commerce"."party_functions" pf
    JOIN "commerce"."party_communications" pc ON pc."id" = pf."party_communication_id"
    JOIN "commerce"."suppliers" s ON s."id" = ss."supplier_id"
    WHERE pf."party_id" = s."party_id" AND pf."function" = 'ORDERING' AND pc."channel" = 'EMAIL'
    ORDER BY pc."is_primary" DESC, pc."created_at"
    LIMIT 1
  )),
  "order_phone_communication_id" = COALESCE(ss."order_phone_communication_id", (
    SELECT pc."id" FROM "commerce"."party_functions" pf
    JOIN "commerce"."party_communications" pc ON pc."id" = pf."party_communication_id"
    JOIN "commerce"."suppliers" s ON s."id" = ss."supplier_id"
    WHERE pf."party_id" = s."party_id" AND pf."function" = 'ORDERING' AND pc."channel" = 'PHONE'
    ORDER BY pc."is_primary" DESC, pc."created_at"
    LIMIT 1
  ))
WHERE ss."order_email_communication_id" IS NULL OR ss."order_phone_communication_id" IS NULL;
