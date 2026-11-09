-- The checkout id lives once, in the reference (and checkout_id); core no longer copies it into metadata. Existing
-- rows lose the copy; metadata that held nothing else becomes null
UPDATE "payments"."payment_intents"
SET "metadata" = NULLIF("metadata" - 'checkoutId', '{}'::jsonb), "updated_at" = now()
WHERE "metadata" ? 'checkoutId';
