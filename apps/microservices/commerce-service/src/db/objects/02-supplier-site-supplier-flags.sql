-- Keeps supplier_sites.is_supplier_* in step with the supplier's is_active, purchasing_blocked and payment_blocked.
--
-- At a site the supplier is active when `is_active AND is_supplier_active`, can be bought from when neither
-- `purchasing_blocked` nor `is_supplier_purchasing_blocked` is set, and can be paid when neither payment flag is set.
-- The site's own flags are never touched by the supplier, so lifting a supplier-wide block restores each site as it was.
--
-- Lives here rather than in the schema because Drizzle Kit has no trigger API. Replayed on every deploy by
-- runMigrationsAndGrants, like 01-offering-variant-active.sql.

CREATE OR REPLACE FUNCTION commerce.sync_supplier_site_supplier_flags() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE commerce.supplier_sites
  SET is_supplier_active = NEW.is_active,
      is_supplier_purchasing_blocked = NEW.purchasing_blocked,
      is_supplier_payment_blocked = NEW.payment_blocked
  WHERE supplier_id = NEW.id
    AND (is_supplier_active IS DISTINCT FROM NEW.is_active
      OR is_supplier_purchasing_blocked IS DISTINCT FROM NEW.purchasing_blocked
      OR is_supplier_payment_blocked IS DISTINCT FROM NEW.payment_blocked);
  RETURN NULL;
END
$$;

DROP TRIGGER IF EXISTS trg_suppliers_sync_site_flags ON commerce.suppliers;
CREATE TRIGGER trg_suppliers_sync_site_flags
AFTER UPDATE OF is_active, purchasing_blocked, payment_blocked ON commerce.suppliers
FOR EACH ROW
WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active
  OR OLD.purchasing_blocked IS DISTINCT FROM NEW.purchasing_blocked
  OR OLD.payment_blocked IS DISTINCT FROM NEW.payment_blocked)
EXECUTE FUNCTION commerce.sync_supplier_site_supplier_flags();

-- A new enrolment inherits the supplier's current flags, so it is never born out of step.
CREATE OR REPLACE FUNCTION commerce.seed_supplier_site_supplier_flags() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT s.is_active, s.purchasing_blocked, s.payment_blocked
  INTO NEW.is_supplier_active, NEW.is_supplier_purchasing_blocked, NEW.is_supplier_payment_blocked
  FROM commerce.suppliers s
  WHERE s.id = NEW.supplier_id;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_supplier_sites_seed_supplier_flags ON commerce.supplier_sites;
CREATE TRIGGER trg_supplier_sites_seed_supplier_flags
BEFORE INSERT ON commerce.supplier_sites
FOR EACH ROW
EXECUTE FUNCTION commerce.seed_supplier_site_supplier_flags();
