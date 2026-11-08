-- Custom SQL migration file, put your code below! --
UPDATE "commerce"."purchase_orders" AS po
SET "legal_entity_id" = s."legal_entity_id"
FROM "commerce"."suppliers" AS s
WHERE s."id" = po."supplier_id" AND po."legal_entity_id" IS NULL;
--> statement-breakpoint
UPDATE "commerce"."goods_receipts" AS gr
SET "legal_entity_id" = s."legal_entity_id"
FROM "commerce"."suppliers" AS s
WHERE s."id" = gr."supplier_id" AND gr."legal_entity_id" IS NULL;
