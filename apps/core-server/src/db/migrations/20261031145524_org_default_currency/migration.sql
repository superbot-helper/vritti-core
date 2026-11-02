ALTER TABLE "core"."organizations" ADD COLUMN "default_currency_code" char(3);--> statement-breakpoint
UPDATE "core"."organizations" AS o SET "default_currency_code" = COALESCE(
  (SELECT le."currency_code" FROM "core"."legal_entities" AS le WHERE le."organization_id" = o."id" ORDER BY le."created_at" LIMIT 1),
  'USD'
);--> statement-breakpoint
ALTER TABLE "core"."organizations" ALTER COLUMN "default_currency_code" SET NOT NULL;
