CREATE TYPE "commerce"."tax_base" AS ENUM('PRICE', 'PRICE_PLUS_PREVIOUS', 'MRP');--> statement-breakpoint
CREATE TYPE "commerce"."tax_calculation" AS ENUM('PERCENT', 'AMOUNT_PER_MEASURE');--> statement-breakpoint
CREATE TYPE "commerce"."tax_measure" AS ENUM('UNIT', 'LITRE', 'PURE_ALCOHOL_LITRE', 'KG');--> statement-breakpoint
CREATE TYPE "commerce"."tax_situation" AS ENUM('ANY', 'DOMESTIC', 'DOMESTIC_SAME_STATE', 'DOMESTIC_OTHER_STATE', 'UNION_B2B', 'UNION_B2C', 'IMPORT', 'EXPORT');--> statement-breakpoint
CREATE TYPE "commerce"."tax_treatment" AS ENUM('TAXABLE', 'ZERO_RATED', 'EXEMPT', 'OUT_OF_SCOPE');--> statement-breakpoint
CREATE TABLE "commerce"."tax_class_groups" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"organization_id" uuid DEFAULT cast(current_setting('app.org_id') as uuid) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"tax_class_id" uuid NOT NULL,
	"tax_group_id" uuid NOT NULL,
	"max_unit_price" bigint,
	"currency_code" varchar(3),
	"valid_from" date NOT NULL,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tax_class_groups_price_limit_chk" CHECK (("max_unit_price" is null) = ("currency_code" is null)),
	CONSTRAINT "tax_class_groups_validity_chk" CHECK ("valid_to" is null or "valid_to" >= "valid_from")
);
--> statement-breakpoint
ALTER TABLE "commerce"."tax_class_groups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "commerce"."tax_group_rates" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"organization_id" uuid DEFAULT cast(current_setting('app.org_id') as uuid) NOT NULL,
	"tax_group_id" uuid NOT NULL,
	"tax_component_id" uuid NOT NULL,
	"situation" "commerce"."tax_situation" NOT NULL,
	"jurisdiction_id" uuid,
	"calculation" "commerce"."tax_calculation" NOT NULL,
	"rate" numeric(7,4),
	"amount" bigint,
	"currency_code" varchar(3),
	"measure" "commerce"."tax_measure",
	"base" "commerce"."tax_base" DEFAULT 'PRICE'::"commerce"."tax_base" NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	"valid_from" date NOT NULL,
	"valid_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tax_group_rates_calculation_chk" CHECK (("calculation" = 'PERCENT' and "rate" is not null and "amount" is null and "currency_code" is null and "measure" is null)
        or ("calculation" = 'AMOUNT_PER_MEASURE' and "rate" is null and "amount" is not null and "currency_code" is not null and "measure" is not null)),
	CONSTRAINT "tax_group_rates_validity_chk" CHECK ("valid_to" is null or "valid_to" >= "valid_from")
);
--> statement-breakpoint
ALTER TABLE "commerce"."tax_group_rates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "le_read" ON "commerce"."tax_groups";--> statement-breakpoint
DROP POLICY "le_write" ON "commerce"."tax_groups";--> statement-breakpoint
DROP POLICY "le_update" ON "commerce"."tax_groups";--> statement-breakpoint
DROP POLICY "le_delete" ON "commerce"."tax_groups";--> statement-breakpoint
DROP TABLE "commerce"."tax_rates";--> statement-breakpoint
ALTER TABLE "commerce"."tax_components" DROP CONSTRAINT "uq_tax_components_org_code";--> statement-breakpoint
DROP INDEX "commerce"."idx_tax_components_org";--> statement-breakpoint
DROP INDEX "commerce"."tax_groups_le_name_unique";--> statement-breakpoint
ALTER TABLE "commerce"."tax_components" ADD COLUMN "country_code" varchar(2) NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."tax_groups" ADD COLUMN "country_code" varchar(2) NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."tax_groups" ADD COLUMN "code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."tax_groups" ADD COLUMN "treatment" "commerce"."tax_treatment" NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."tax_groups" ADD COLUMN "legal_text" text;--> statement-breakpoint
ALTER TABLE "commerce"."tax_groups" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."tax_groups" DROP COLUMN "legal_entity_id";--> statement-breakpoint
ALTER TABLE "commerce"."tax_components" ADD CONSTRAINT "uq_tax_components_org_country_code" UNIQUE("organization_id","country_code","code");--> statement-breakpoint
ALTER TABLE "commerce"."tax_groups" ADD CONSTRAINT "uq_tax_groups_org_country_code" UNIQUE("organization_id","country_code","code");--> statement-breakpoint
CREATE INDEX "idx_tax_class_groups_org_country_class" ON "commerce"."tax_class_groups" ("organization_id","country_code","tax_class_id");--> statement-breakpoint
CREATE INDEX "idx_tax_class_groups_group" ON "commerce"."tax_class_groups" ("tax_group_id");--> statement-breakpoint
CREATE INDEX "idx_tax_components_org_country" ON "commerce"."tax_components" ("organization_id","country_code");--> statement-breakpoint
CREATE INDEX "idx_tax_group_rates_group" ON "commerce"."tax_group_rates" ("tax_group_id");--> statement-breakpoint
CREATE INDEX "idx_tax_group_rates_component" ON "commerce"."tax_group_rates" ("tax_component_id");--> statement-breakpoint
CREATE INDEX "idx_tax_group_rates_jurisdiction" ON "commerce"."tax_group_rates" ("jurisdiction_id");--> statement-breakpoint
CREATE INDEX "idx_tax_groups_org_country" ON "commerce"."tax_groups" ("organization_id","country_code");--> statement-breakpoint
ALTER TABLE "commerce"."tax_class_groups" ADD CONSTRAINT "tax_class_groups_tax_class_id_tax_classes_id_fkey" FOREIGN KEY ("tax_class_id") REFERENCES "commerce"."tax_classes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commerce"."tax_class_groups" ADD CONSTRAINT "tax_class_groups_tax_group_id_tax_groups_id_fkey" FOREIGN KEY ("tax_group_id") REFERENCES "commerce"."tax_groups"("id");--> statement-breakpoint
ALTER TABLE "commerce"."tax_group_rates" ADD CONSTRAINT "tax_group_rates_tax_group_id_tax_groups_id_fkey" FOREIGN KEY ("tax_group_id") REFERENCES "commerce"."tax_groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commerce"."tax_group_rates" ADD CONSTRAINT "tax_group_rates_tax_component_id_tax_components_id_fkey" FOREIGN KEY ("tax_component_id") REFERENCES "commerce"."tax_components"("id");--> statement-breakpoint
ALTER TABLE "commerce"."tax_group_rates" ADD CONSTRAINT "tax_group_rates_jurisdiction_id_tax_jurisdictions_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "commerce"."tax_jurisdictions"("id");--> statement-breakpoint
ALTER TABLE "commerce"."tax_groups" ADD CONSTRAINT "tax_groups_code_chk" CHECK ("code" ~ '^[a-z0-9][a-z0-9-]*$');--> statement-breakpoint
CREATE POLICY "org_isolation" ON "commerce"."tax_class_groups" AS PERMISSIVE FOR ALL TO public USING (organization_id = (select current_setting('app.org_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "org_isolation" ON "commerce"."tax_group_rates" AS PERMISSIVE FOR ALL TO public USING (organization_id = (select current_setting('app.org_id', true)::uuid));