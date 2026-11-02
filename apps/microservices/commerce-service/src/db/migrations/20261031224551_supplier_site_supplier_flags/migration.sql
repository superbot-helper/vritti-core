UPDATE "commerce"."supplier_sites" ss
SET
  "is_supplier_active" = s."is_active",
  "is_supplier_purchasing_blocked" = s."purchasing_blocked",
  "is_supplier_payment_blocked" = s."payment_blocked"
FROM "commerce"."suppliers" s
WHERE s."id" = ss."supplier_id";
