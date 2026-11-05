-- Custom SQL migration file, put your code below! --
UPDATE "commerce"."supplier_quotation_sites" AS qs
SET "legal_entity_id" = q."legal_entity_id"
FROM "commerce"."supplier_quotations" AS q
WHERE q."id" = qs."quotation_id" AND qs."legal_entity_id" IS NULL;
