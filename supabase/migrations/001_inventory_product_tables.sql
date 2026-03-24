-- Migration 001: Add inventory_snapshots and product_mappings read models
-- Run this against an existing database that already has the base schema.
-- Safe to re-run: all statements use IF NOT EXISTS where supported.

-- Inventory Snapshots: per-SKU + location read model, updated by inventorySync
CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL,
  location_id TEXT NOT NULL,
  shopify_qty INTEGER,
  odoo_qty INTEGER,
  drift INTEGER GENERATED ALWAYS AS (COALESCE(shopify_qty, 0) - COALESCE(odoo_qty, 0)) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('synced', 'failed', 'pending', 'drift')),
  last_synced_at TIMESTAMPTZ,
  last_error TEXT,
  sync_event_id UUID REFERENCES sync_events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (sku, location_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_sku      ON inventory_snapshots(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_status   ON inventory_snapshots(status);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_location ON inventory_snapshots(location_id);

-- Reuse the existing update_updated_at_column() trigger function from base schema.
-- Trigger creation is not idempotent in older Postgres; drop first to be safe.
DROP TRIGGER IF EXISTS update_inventory_snapshots_updated_at ON inventory_snapshots;
CREATE TRIGGER update_inventory_snapshots_updated_at
  BEFORE UPDATE ON inventory_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_snapshots' AND policyname = 'Service role full access'
  ) THEN
    CREATE POLICY "Service role full access" ON inventory_snapshots
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_snapshots' AND policyname = 'Authenticated users can read'
  ) THEN
    CREATE POLICY "Authenticated users can read" ON inventory_snapshots
      FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Product Mappings: SKU <-> Shopify inventory_item_id <-> Odoo product_id
CREATE TABLE IF NOT EXISTS product_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL UNIQUE,
  shopify_inventory_item_id TEXT,
  odoo_product_id INTEGER,
  odoo_product_name TEXT,
  mapping_status TEXT NOT NULL DEFAULT 'pending' CHECK (mapping_status IN ('mapped', 'missing_odoo', 'missing_sku', 'error', 'pending')),
  last_checked_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_mappings_sku     ON product_mappings(sku);
CREATE INDEX IF NOT EXISTS idx_product_mappings_status  ON product_mappings(mapping_status);
CREATE INDEX IF NOT EXISTS idx_product_mappings_odoo_id ON product_mappings(odoo_product_id);

DROP TRIGGER IF EXISTS update_product_mappings_updated_at ON product_mappings;
CREATE TRIGGER update_product_mappings_updated_at
  BEFORE UPDATE ON product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'product_mappings' AND policyname = 'Service role full access'
  ) THEN
    CREATE POLICY "Service role full access" ON product_mappings
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'product_mappings' AND policyname = 'Authenticated users can read'
  ) THEN
    CREATE POLICY "Authenticated users can read" ON product_mappings
      FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;
