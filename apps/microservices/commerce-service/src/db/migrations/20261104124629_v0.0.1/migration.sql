DROP POLICY "le_read" ON "commerce"."supplier_sites";--> statement-breakpoint
DROP POLICY "le_write" ON "commerce"."supplier_sites";--> statement-breakpoint
DROP POLICY "le_update" ON "commerce"."supplier_sites";--> statement-breakpoint
DROP POLICY "le_delete" ON "commerce"."supplier_sites";--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."supplier_sites";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."supplier_sites";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."supplier_sites";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."supplier_sites";--> statement-breakpoint
DROP POLICY "le_read" ON "commerce"."suppliers";--> statement-breakpoint
DROP POLICY "le_write" ON "commerce"."suppliers";--> statement-breakpoint
DROP POLICY "le_update" ON "commerce"."suppliers";--> statement-breakpoint
DROP POLICY "le_delete" ON "commerce"."suppliers";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."supplier_sites" AS RESTRICTIVE FOR SELECT TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then site_id = any(string_to_array(nullif(current_setting('app.site_ids', true), ''), ',')::uuid[])
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.org_id', true), '') as uuid) is not null then true
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."supplier_sites" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."supplier_sites" AS RESTRICTIVE FOR UPDATE TO public USING (coalesce(
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
CREATE POLICY "owner_delete" ON "commerce"."supplier_sites" AS RESTRICTIVE FOR DELETE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "org_isolation" ON "commerce"."supplier_items" AS PERMISSIVE FOR ALL TO public USING (organization_id = (select current_setting('app.org_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."supplier_items" AS RESTRICTIVE FOR SELECT TO public USING (exists (select 1 from commerce.suppliers o where o.id = supplier_id));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."supplier_items" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (exists (select 1 from commerce.suppliers o where o.id = supplier_id and 
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    else false
  end));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."supplier_items" AS RESTRICTIVE FOR UPDATE TO public USING (exists (select 1 from commerce.suppliers o where o.id = supplier_id and 
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    else false
  end));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."supplier_items" AS RESTRICTIVE FOR DELETE TO public USING (exists (select 1 from commerce.suppliers o where o.id = supplier_id and 
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then o.legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    else false
  end));--> statement-breakpoint
CREATE POLICY "reach_read" ON "commerce"."suppliers" AS RESTRICTIVE FOR SELECT TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then true
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.org_id', true), '') as uuid) is not null then true
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_insert" ON "commerce"."suppliers" AS RESTRICTIVE FOR INSERT TO public WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_update" ON "commerce"."suppliers" AS RESTRICTIVE FOR UPDATE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    else false
  end, false)) WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    else false
  end, false));--> statement-breakpoint
CREATE POLICY "owner_delete" ON "commerce"."suppliers" AS RESTRICTIVE FOR DELETE TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    else false
  end, false));