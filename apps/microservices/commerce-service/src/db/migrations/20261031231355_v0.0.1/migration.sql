ALTER TABLE "commerce"."party_tax_registrations" ALTER COLUMN "registration_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "commerce"."tax_registrations" ALTER COLUMN "registration_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "commerce"."tax_registration_type";--> statement-breakpoint
CREATE TYPE "commerce"."tax_registration_type" AS ENUM('GSTIN', 'VAT', 'TIN', 'OTHER');--> statement-breakpoint
ALTER TABLE "commerce"."party_tax_registrations" ALTER COLUMN "registration_type" SET DATA TYPE "commerce"."tax_registration_type" USING "registration_type"::"commerce"."tax_registration_type";--> statement-breakpoint
ALTER TABLE "commerce"."tax_registrations" ALTER COLUMN "registration_type" SET DATA TYPE "commerce"."tax_registration_type" USING "registration_type"::"commerce"."tax_registration_type";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_sites" ALTER COLUMN "party_tax_registration_id" DROP NOT NULL;