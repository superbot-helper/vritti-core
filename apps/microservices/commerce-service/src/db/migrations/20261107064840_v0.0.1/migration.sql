ALTER TABLE "commerce"."tax_jurisdictions" ALTER COLUMN "level" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "commerce"."tax_jurisdiction_level";--> statement-breakpoint
CREATE TYPE "commerce"."tax_jurisdiction_level" AS ENUM('STATE', 'COUNTY', 'CITY', 'DISTRICT');--> statement-breakpoint
ALTER TABLE "commerce"."tax_jurisdictions" ALTER COLUMN "level" SET DATA TYPE "commerce"."tax_jurisdiction_level" USING "level"::"commerce"."tax_jurisdiction_level";--> statement-breakpoint
ALTER TABLE "commerce"."party_tax_registrations" ALTER COLUMN "country_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."tax_registrations" ALTER COLUMN "country_code" SET NOT NULL;