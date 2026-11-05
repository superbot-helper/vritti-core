-- Keeps supplier_enrollments.is_supplier_active in step with its supplier's is_active.
--
-- A supplier is active at a site when `is_active AND is_supplier_active`: the enrollment's own flag is never touched
-- by the supplier, so deactivating a supplier and bringing it back restores exactly the sites that were active before
-- instead of switching every site on. Purchasing and payment blocks live only on the supplier and are read from it.
--
-- Lives here rather than in the schema because Drizzle Kit has no trigger API — its `entities` config lists triggers
-- as planned, not shipped. This file is replayed in filename order on every deploy by runMigrationsAndGrants, so a
-- dropped trigger heals itself. Delete it once Drizzle manages triggers natively.

CREATE OR REPLACE FUNCTION commerce.sync_supplier_enrollment_supplier_active() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE commerce.supplier_enrollments
  SET is_supplier_active = NEW.is_active
  WHERE supplier_id = NEW.id
    AND is_supplier_active IS DISTINCT FROM NEW.is_active;
  RETURN NULL;
END
$$;

DROP TRIGGER IF EXISTS trg_suppliers_sync_enrollment_active ON commerce.suppliers;
CREATE TRIGGER trg_suppliers_sync_enrollment_active
AFTER UPDATE OF is_active ON commerce.suppliers
FOR EACH ROW
WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
EXECUTE FUNCTION commerce.sync_supplier_enrollment_supplier_active();

-- A new enrollment inherits its supplier's current status, so it is never born out of step.
CREATE OR REPLACE FUNCTION commerce.seed_supplier_enrollment_supplier_active() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT s.is_active INTO NEW.is_supplier_active
  FROM commerce.suppliers s
  WHERE s.id = NEW.supplier_id;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_supplier_enrollments_seed_supplier_active ON commerce.supplier_enrollments;
CREATE TRIGGER trg_supplier_enrollments_seed_supplier_active
BEFORE INSERT ON commerce.supplier_enrollments
FOR EACH ROW
EXECUTE FUNCTION commerce.seed_supplier_enrollment_supplier_active();
