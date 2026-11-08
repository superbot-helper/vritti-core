-- Custom SQL migration file, put your code below! --
UPDATE "commerce"."tax_registrations" AS registration SET "country_code" = jurisdiction."country_code"
FROM "commerce"."tax_jurisdictions" AS jurisdiction
WHERE jurisdiction."id" = registration."jurisdiction_id" AND registration."country_code" IS NULL;
--> statement-breakpoint
UPDATE "commerce"."party_tax_registrations" AS registration SET "country_code" = jurisdiction."country_code"
FROM "commerce"."tax_jurisdictions" AS jurisdiction
WHERE jurisdiction."id" = registration."jurisdiction_id" AND registration."country_code" IS NULL;
--> statement-breakpoint
UPDATE "commerce"."parties" AS party SET "country_code" = jurisdiction."country_code"
FROM "commerce"."tax_jurisdictions" AS jurisdiction
WHERE jurisdiction."id" = party."jurisdiction_id" AND party."country_code" IS NULL;
--> statement-breakpoint
UPDATE "commerce"."parties" SET "jurisdiction_id" = NULL
WHERE "jurisdiction_id" IN (SELECT "id" FROM "commerce"."tax_jurisdictions" WHERE "level" = 'COUNTRY');
--> statement-breakpoint
UPDATE "commerce"."tax_registrations" SET "jurisdiction_id" = NULL
WHERE "jurisdiction_id" IN (SELECT "id" FROM "commerce"."tax_jurisdictions" WHERE "level" = 'COUNTRY');
--> statement-breakpoint
UPDATE "commerce"."party_tax_registrations" SET "jurisdiction_id" = NULL
WHERE "jurisdiction_id" IN (SELECT "id" FROM "commerce"."tax_jurisdictions" WHERE "level" = 'COUNTRY');
--> statement-breakpoint
UPDATE "commerce"."tax_jurisdictions" SET "parent_id" = NULL
WHERE "parent_id" IN (SELECT "id" FROM "commerce"."tax_jurisdictions" WHERE "level" = 'COUNTRY');
--> statement-breakpoint
DELETE FROM "commerce"."tax_jurisdictions" WHERE "level" = 'COUNTRY';
