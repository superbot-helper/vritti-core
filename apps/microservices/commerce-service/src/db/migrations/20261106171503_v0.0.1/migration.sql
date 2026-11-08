CREATE TYPE "commerce"."supplier_invoice_status" AS ENUM('DRAFT', 'POSTED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "commerce"."supplier_invoice_line_receipts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"organization_id" uuid DEFAULT cast(current_setting('app.org_id') as uuid) NOT NULL,
	"supplier_invoice_line_id" uuid NOT NULL,
	"goods_receipt_item_id" uuid NOT NULL,
	"goods_receipt_lot_id" uuid,
	"quantity" numeric(12,3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_supplier_invoice_line_receipts" UNIQUE NULLS NOT DISTINCT("supplier_invoice_line_id","goods_receipt_item_id","goods_receipt_lot_id")
);
--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_line_receipts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "commerce"."supplier_invoice_lines" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"organization_id" uuid DEFAULT cast(current_setting('app.org_id') as uuid) NOT NULL,
	"supplier_invoice_id" uuid NOT NULL,
	"purchase_order_item_id" uuid NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"uom_id" uuid NOT NULL,
	"lot_number" varchar(100),
	"expiry_date" date,
	"mrp" bigint,
	"billed_qty" numeric(12,3) NOT NULL,
	"free_qty" numeric(12,3) DEFAULT '0' NOT NULL,
	"unit_price" bigint NOT NULL,
	"discount_amount" bigint DEFAULT 0 NOT NULL,
	"tax_amount" bigint DEFAULT 0 NOT NULL,
	"line_total" bigint NOT NULL,
	"flags" jsonb DEFAULT '[]' NOT NULL,
	"variance_amount" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_lines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "commerce"."supplier_invoices" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"organization_id" uuid DEFAULT cast(current_setting('app.org_id') as uuid) NOT NULL,
	"legal_entity_id" uuid DEFAULT cast(nullif(current_setting('app.le_id', true), '') as uuid) NOT NULL,
	"site_id" uuid DEFAULT cast(nullif(current_setting('app.site_id', true), '') as uuid) NOT NULL,
	"supplier_id" uuid NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"invoice_number" varchar(100) NOT NULL,
	"invoice_date" date NOT NULL,
	"currency_code" varchar(3) NOT NULL,
	"exchange_rate" numeric(18,6),
	"status" "commerce"."supplier_invoice_status" DEFAULT 'DRAFT'::"commerce"."supplier_invoice_status" NOT NULL,
	"subtotal" bigint DEFAULT 0 NOT NULL,
	"discount_amount" bigint DEFAULT 0 NOT NULL,
	"tax_amount" bigint DEFAULT 0 NOT NULL,
	"total_amount" bigint DEFAULT 0 NOT NULL,
	"flag_count" integer DEFAULT 0 NOT NULL,
	"flags" jsonb DEFAULT '[]' NOT NULL,
	"notes" text,
	"created_by" uuid,
	"posted_by" uuid,
	"posted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_supplier_invoices_supplier_number" UNIQUE("supplier_id","invoice_number")
);
--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."goods_receipt_items";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."goods_receipt_items";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."goods_receipt_items";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."goods_receipt_items";--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."goods_receipt_line_items";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."goods_receipt_line_items";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."goods_receipt_line_items";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."goods_receipt_line_items";--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."goods_receipt_lines";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."goods_receipt_lines";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."goods_receipt_lines";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."goods_receipt_lines";--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."goods_receipt_lots";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."goods_receipt_lots";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."goods_receipt_lots";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."goods_receipt_lots";--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."goods_receipts";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."goods_receipts";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."goods_receipts";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."goods_receipts";--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."purchase_orders";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."purchase_orders";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."purchase_orders";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."purchase_orders";--> statement-breakpoint
ALTER TABLE "commerce"."purchase_order_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP CONSTRAINT "uq_goods_receipt_items_gr_item_uom";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" ADD COLUMN "purchase_order_item_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" ADD COLUMN "received_qty" numeric(12,3) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipts" ADD COLUMN "legal_entity_id" uuid DEFAULT cast(nullif(current_setting('app.le_id', true), '') as uuid);--> statement-breakpoint
ALTER TABLE "commerce"."purchase_orders" ADD COLUMN "legal_entity_id" uuid DEFAULT cast(nullif(current_setting('app.le_id', true), '') as uuid);--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "ordered_qty";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "scheme_buy_qty";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "scheme_free_qty";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "has_scheme";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "free_qty";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "total_qty";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "unit_price";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "primary_uom_unit_price";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "unit_cost";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" DROP COLUMN "currency_code";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipts" DROP COLUMN "exchange_rate";--> statement-breakpoint
ALTER TABLE "commerce"."purchase_orders" DROP COLUMN "exchange_rate_type";--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipts" ALTER COLUMN "purchase_order_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."purchase_orders" ALTER COLUMN "exchange_rate" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" ADD CONSTRAINT "uq_goods_receipt_items_gr_po_item" UNIQUE("goods_receipt_id","purchase_order_item_id");--> statement-breakpoint
CREATE INDEX "idx_goods_receipt_items_po_item" ON "commerce"."goods_receipt_items" ("purchase_order_item_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_invoice_line_receipts_gr_item" ON "commerce"."supplier_invoice_line_receipts" ("goods_receipt_item_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_invoice_lines_invoice" ON "commerce"."supplier_invoice_lines" ("supplier_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_invoice_lines_po_item" ON "commerce"."supplier_invoice_lines" ("purchase_order_item_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_invoices_site" ON "commerce"."supplier_invoices" ("site_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_invoices_po" ON "commerce"."supplier_invoices" ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_invoices_supplier" ON "commerce"."supplier_invoices" ("supplier_id");--> statement-breakpoint
ALTER TABLE "commerce"."goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_LfHoAU3Xn983_fkey" FOREIGN KEY ("purchase_order_item_id") REFERENCES "commerce"."purchase_order_items"("id");--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_line_receipts" ADD CONSTRAINT "supplier_invoice_line_receipts_q9FydeC4CwOW_fkey" FOREIGN KEY ("supplier_invoice_line_id") REFERENCES "commerce"."supplier_invoice_lines"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_line_receipts" ADD CONSTRAINT "supplier_invoice_line_receipts_2XaydPd3nYX8_fkey" FOREIGN KEY ("goods_receipt_item_id") REFERENCES "commerce"."goods_receipt_items"("id");--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_line_receipts" ADD CONSTRAINT "supplier_invoice_line_receipts_UPdYLJOzwyQy_fkey" FOREIGN KEY ("goods_receipt_lot_id") REFERENCES "commerce"."goods_receipt_lots"("id");--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_VBWq3yqZVrvX_fkey" FOREIGN KEY ("supplier_invoice_id") REFERENCES "commerce"."supplier_invoices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_Clt6tjlN6jlz_fkey" FOREIGN KEY ("purchase_order_item_id") REFERENCES "commerce"."purchase_order_items"("id");--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_eAzfBPBFM157_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "commerce"."inventory_items"("id");--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_uom_id_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "commerce"."uom"("id");--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoices" ADD CONSTRAINT "supplier_invoices_supplier_id_suppliers_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "commerce"."suppliers"("id");--> statement-breakpoint
ALTER TABLE "commerce"."supplier_invoices" ADD CONSTRAINT "supplier_invoices_purchase_order_id_purchase_orders_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "commerce"."purchase_orders"("id");--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."goods_receipt_items" AS RESTRICTIVE FOR SELECT TO public USING (exists (select 1 from commerce.goods_receipts o where o.id = goods_receipt_id));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."goods_receipt_items" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (exists (select 1 from commerce.goods_receipts o where o.id = goods_receipt_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."goods_receipt_items" AS RESTRICTIVE FOR UPDATE TO public USING (exists (select 1 from commerce.goods_receipts o where o.id = goods_receipt_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."goods_receipt_items" AS RESTRICTIVE FOR DELETE TO public USING (exists (select 1 from commerce.goods_receipts o where o.id = goods_receipt_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."goods_receipt_line_items" AS RESTRICTIVE FOR SELECT TO public USING (exists (select 1 from commerce.goods_receipt_lines p where p.id = goods_receipt_line_id));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."goods_receipt_line_items" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (exists (select 1 from commerce.goods_receipt_lines p join commerce.goods_receipt_items p2 on p2.id = p.goods_receipt_item_id join commerce.goods_receipts o on o.id = p2.goods_receipt_id where p.id = goods_receipt_line_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."goods_receipt_line_items" AS RESTRICTIVE FOR UPDATE TO public USING (exists (select 1 from commerce.goods_receipt_lines p join commerce.goods_receipt_items p2 on p2.id = p.goods_receipt_item_id join commerce.goods_receipts o on o.id = p2.goods_receipt_id where p.id = goods_receipt_line_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."goods_receipt_line_items" AS RESTRICTIVE FOR DELETE TO public USING (exists (select 1 from commerce.goods_receipt_lines p join commerce.goods_receipt_items p2 on p2.id = p.goods_receipt_item_id join commerce.goods_receipts o on o.id = p2.goods_receipt_id where p.id = goods_receipt_line_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."goods_receipt_lines" AS RESTRICTIVE FOR SELECT TO public USING (exists (select 1 from commerce.goods_receipt_items p where p.id = goods_receipt_item_id));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."goods_receipt_lines" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (exists (select 1 from commerce.goods_receipt_items p join commerce.goods_receipts o on o.id = p.goods_receipt_id where p.id = goods_receipt_item_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."goods_receipt_lines" AS RESTRICTIVE FOR UPDATE TO public USING (exists (select 1 from commerce.goods_receipt_items p join commerce.goods_receipts o on o.id = p.goods_receipt_id where p.id = goods_receipt_item_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."goods_receipt_lines" AS RESTRICTIVE FOR DELETE TO public USING (exists (select 1 from commerce.goods_receipt_items p join commerce.goods_receipts o on o.id = p.goods_receipt_id where p.id = goods_receipt_item_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."goods_receipt_lots" AS RESTRICTIVE FOR SELECT TO public USING (exists (select 1 from commerce.goods_receipt_items p where p.id = goods_receipt_item_id));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."goods_receipt_lots" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (exists (select 1 from commerce.goods_receipt_items p join commerce.goods_receipts o on o.id = p.goods_receipt_id where p.id = goods_receipt_item_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."goods_receipt_lots" AS RESTRICTIVE FOR UPDATE TO public USING (exists (select 1 from commerce.goods_receipt_items p join commerce.goods_receipts o on o.id = p.goods_receipt_id where p.id = goods_receipt_item_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."goods_receipt_lots" AS RESTRICTIVE FOR DELETE TO public USING (exists (select 1 from commerce.goods_receipt_items p join commerce.goods_receipts o on o.id = p.goods_receipt_id where p.id = goods_receipt_item_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."goods_receipts" AS RESTRICTIVE FOR SELECT TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then site_id = any(string_to_array(nullif(current_setting('app.site_ids', true), ''), ',')::uuid[])
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.org_id', true), '') as uuid) is not null then true
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."goods_receipts" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."goods_receipts" AS RESTRICTIVE FOR UPDATE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)) WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."goods_receipts" AS RESTRICTIVE FOR DELETE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "org_isolation" ON "commerce"."purchase_order_items" AS PERMISSIVE FOR ALL TO public USING (organization_id = (select current_setting('app.org_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."purchase_order_items" AS RESTRICTIVE FOR SELECT TO public USING (exists (select 1 from commerce.purchase_orders o where o.id = purchase_order_id));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."purchase_order_items" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (exists (select 1 from commerce.purchase_orders o where o.id = purchase_order_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."purchase_order_items" AS RESTRICTIVE FOR UPDATE TO public USING (exists (select 1 from commerce.purchase_orders o where o.id = purchase_order_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."purchase_order_items" AS RESTRICTIVE FOR DELETE TO public USING (exists (select 1 from commerce.purchase_orders o where o.id = purchase_order_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."purchase_orders" AS RESTRICTIVE FOR SELECT TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then site_id = any(string_to_array(nullif(current_setting('app.site_ids', true), ''), ',')::uuid[])
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.org_id', true), '') as uuid) is not null then true
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."purchase_orders" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."purchase_orders" AS RESTRICTIVE FOR UPDATE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)) WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."purchase_orders" AS RESTRICTIVE FOR DELETE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "org_isolation" ON "commerce"."supplier_invoice_line_receipts" AS PERMISSIVE FOR ALL TO public USING (organization_id = (select current_setting('app.org_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."supplier_invoice_line_receipts" AS RESTRICTIVE FOR SELECT TO public USING (exists (select 1 from commerce.supplier_invoice_lines p where p.id = supplier_invoice_line_id));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."supplier_invoice_line_receipts" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (exists (select 1 from commerce.supplier_invoice_lines p join commerce.supplier_invoices o on o.id = p.supplier_invoice_id where p.id = supplier_invoice_line_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."supplier_invoice_line_receipts" AS RESTRICTIVE FOR UPDATE TO public USING (exists (select 1 from commerce.supplier_invoice_lines p join commerce.supplier_invoices o on o.id = p.supplier_invoice_id where p.id = supplier_invoice_line_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."supplier_invoice_line_receipts" AS RESTRICTIVE FOR DELETE TO public USING (exists (select 1 from commerce.supplier_invoice_lines p join commerce.supplier_invoices o on o.id = p.supplier_invoice_id where p.id = supplier_invoice_line_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "org_isolation" ON "commerce"."supplier_invoice_lines" AS PERMISSIVE FOR ALL TO public USING (organization_id = (select current_setting('app.org_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."supplier_invoice_lines" AS RESTRICTIVE FOR SELECT TO public USING (exists (select 1 from commerce.supplier_invoices o where o.id = supplier_invoice_id));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."supplier_invoice_lines" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (exists (select 1 from commerce.supplier_invoices o where o.id = supplier_invoice_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."supplier_invoice_lines" AS RESTRICTIVE FOR UPDATE TO public USING (exists (select 1 from commerce.supplier_invoices o where o.id = supplier_invoice_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."supplier_invoice_lines" AS RESTRICTIVE FOR DELETE TO public USING (exists (select 1 from commerce.supplier_invoices o where o.id = supplier_invoice_id and coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then o.site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and o.site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or o.site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)));--> statement-breakpoint
CREATE POLICY "org_isolation" ON "commerce"."supplier_invoices" AS PERMISSIVE FOR ALL TO public USING (organization_id = (select current_setting('app.org_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."supplier_invoices" AS RESTRICTIVE FOR SELECT TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then site_id = any(string_to_array(nullif(current_setting('app.site_ids', true), ''), ',')::uuid[])
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.org_id', true), '') as uuid) is not null then true
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."supplier_invoices" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."supplier_invoices" AS RESTRICTIVE FOR UPDATE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false)) WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."supplier_invoices" AS RESTRICTIVE FOR DELETE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
DROP TYPE "commerce"."exchange_rate_type";