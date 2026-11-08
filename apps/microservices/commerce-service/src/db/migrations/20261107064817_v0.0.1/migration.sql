CREATE TYPE "commerce"."tax_registration_scheme" AS ENUM('REGULAR', 'COMPOSITION', 'SEZ');--> statement-breakpoint
ALTER TABLE "commerce"."party_tax_registrations" DROP CONSTRAINT "uq_party_tax_reg_party_juris";--> statement-breakpoint
ALTER TABLE "commerce"."tax_registrations" DROP CONSTRAINT "uq_tax_registrations_le_juris";--> statement-breakpoint
ALTER TABLE "commerce"."parties" ADD COLUMN "country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "commerce"."party_tax_registrations" ADD COLUMN "country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "commerce"."party_tax_registrations" ADD COLUMN "scheme" "commerce"."tax_registration_scheme" DEFAULT 'REGULAR'::"commerce"."tax_registration_scheme" NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."tax_registrations" ADD COLUMN "country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "commerce"."party_tax_registrations" ALTER COLUMN "jurisdiction_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."tax_registrations" ALTER COLUMN "jurisdiction_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."party_tax_registrations" ADD CONSTRAINT "uq_party_tax_reg_party_country_juris" UNIQUE NULLS NOT DISTINCT("party_id","country_code","jurisdiction_id");--> statement-breakpoint
ALTER TABLE "commerce"."tax_registrations" ADD CONSTRAINT "uq_tax_registrations_le_country_juris" UNIQUE NULLS NOT DISTINCT("legal_entity_id","country_code","jurisdiction_id");