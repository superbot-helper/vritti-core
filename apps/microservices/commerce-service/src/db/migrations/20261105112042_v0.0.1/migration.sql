ALTER TABLE "commerce"."supplier_quotation_sites" ADD COLUMN "legal_entity_id" uuid DEFAULT cast(nullif(current_setting('app.le_id', true), '') as uuid);--> statement-breakpoint
ALTER POLICY "reach_read" ON "commerce"."supplier_quotation_sites" TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then site_id = any(string_to_array(nullif(current_setting('app.site_ids', true), ''), ',')::uuid[])
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.org_id', true), '') as uuid) is not null then true
    else false
  end, false));--> statement-breakpoint
ALTER POLICY "owner_insert" ON "commerce"."supplier_quotation_sites" TO public WITH CHECK (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
ALTER POLICY "owner_update" ON "commerce"."supplier_quotation_sites" TO public USING (coalesce(
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
ALTER POLICY "owner_delete" ON "commerce"."supplier_quotation_sites" TO public USING (coalesce(
  case
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid) and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid)
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then false
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and site_id is not null
      and (string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[] is null or site_id = any(string_to_array(nullif(current_setting('app.le_site_ids', true), ''), ',')::uuid[]))
    else false
  end, false));--> statement-breakpoint
ALTER POLICY "reach_read" ON "commerce"."supplier_quotations" TO public USING (
  case
    -- a site: org-owned rows, its own LE's rows, its own rows
    when cast(nullif(current_setting('app.site_id', true), '') as uuid) is not null then (legal_entity_id is null and site_id is null)
      or (site_id is null and legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid) and id in (select l.quotation_id from commerce.supplier_quotation_sites l))
      or (site_id = cast(nullif(current_setting('app.site_id', true), '') as uuid))
    -- a site group: org-owned rows plus whatever its member sites own, and nothing else
    when cast(nullif(current_setting('app.site_group_id', true), '') as uuid) is not null then (legal_entity_id is null and site_id is null)
      or (site_id = any(string_to_array(nullif(current_setting('app.site_ids', true), ''), ',')::uuid[]))
    -- an LE: org-owned rows, its own rows, and everything its sites own
    when cast(nullif(current_setting('app.le_id', true), '') as uuid) is not null then (legal_entity_id is null and site_id is null)
      or (legal_entity_id = cast(nullif(current_setting('app.le_id', true), '') as uuid))
    -- the org workspace: every row in the organization
    when cast(nullif(current_setting('app.org_id', true), '') as uuid) is not null then true
    else false
  end);