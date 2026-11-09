-- Rule: a party has at most one OPEN checkout. Before the partial unique index arrives, every party's older OPEN
-- checkouts are closed, keeping the newest. A closed checkout's expires_at holds the moment it closed (the status says
-- why), and any payment intent still waiting on one of them ends by its own deadline
UPDATE "commerce"."checkouts" AS c
SET "status" = 'CANCELLED', "expires_at" = now(), "updated_at" = now()
WHERE c."status" = 'OPEN'
  AND EXISTS (
    SELECT 1
    FROM "commerce"."checkouts" AS n
    WHERE n."organization_id" = c."organization_id"
      AND n."party_id" = c."party_id"
      AND n."status" = 'OPEN'
      AND (n."created_at" > c."created_at" OR (n."created_at" = c."created_at" AND n."id" > c."id"))
  );
