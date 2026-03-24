-- Supabase SQL Schema for Sync Events
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sync Events Table
CREATE TABLE IF NOT EXISTS sync_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Sync type and direction
  type TEXT NOT NULL CHECK (type IN ('order', 'inventory', 'fulfillment', 'customer', 'product')),
  direction TEXT NOT NULL CHECK (direction IN ('shopify_to_odoo', 'odoo_to_shopify')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'retry')),
  
  -- Source identifiers
  shopify_id TEXT,
  odoo_id INTEGER,
  
  -- Payload storage (JSONB for efficient querying)
  source_payload JSONB,
  transformed_payload JSONB,
  
  -- Error handling
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Metadata
  webhook_id TEXT,
  job_id TEXT,
  processing_time_ms INTEGER
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sync_events_status ON sync_events(status);
CREATE INDEX IF NOT EXISTS idx_sync_events_type ON sync_events(type);
CREATE INDEX IF NOT EXISTS idx_sync_events_created_at ON sync_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_events_shopify_id ON sync_events(shopify_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_retry ON sync_events(status, next_retry_at) WHERE status = 'retry';

-- Composite index for filtering
CREATE INDEX IF NOT EXISTS idx_sync_events_type_status_date ON sync_events(type, status, created_at DESC);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = '';

-- Trigger for updated_at
CREATE TRIGGER update_sync_events_updated_at
  BEFORE UPDATE ON sync_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access" ON sync_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read" ON sync_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Order ID Mappings (Shopify ↔ Odoo)
CREATE TABLE IF NOT EXISTS order_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopify_order_id TEXT UNIQUE NOT NULL,
  shopify_order_number TEXT,
  odoo_order_id INTEGER,
  odoo_order_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'cancelled', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_order_mappings_shopify_id ON order_mappings(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_order_mappings_odoo_id ON order_mappings(odoo_order_id);
CREATE INDEX IF NOT EXISTS idx_order_mappings_status ON order_mappings(status);

-- RLS for order_mappings
ALTER TABLE order_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON order_mappings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read" ON order_mappings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at on order_mappings is not needed (no updated_at column)

-- Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
  hash TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-expire old sessions (cleanup via index for efficient deletion)
CREATE INDEX IF NOT EXISTS idx_admin_sessions_created_at ON admin_sessions(created_at);

-- RLS for admin_sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON admin_sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- View for stats
CREATE OR REPLACE VIEW sync_stats
WITH (security_invoker = true) AS
SELECT
  type,
  status,
  COUNT(*) as count,
  AVG(processing_time_ms)::INTEGER as avg_processing_time_ms,
  DATE_TRUNC('hour', created_at) as hour
FROM sync_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type, status, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Rate Limit Entries Table (for multi-instance rate limiting)
CREATE TABLE IF NOT EXISTS rate_limit_entries (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_entries_reset_at ON rate_limit_entries(reset_at);

ALTER TABLE rate_limit_entries ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_sku ON inventory_snapshots(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_status ON inventory_snapshots(status);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_location ON inventory_snapshots(location_id);

CREATE TRIGGER update_inventory_snapshots_updated_at
  BEFORE UPDATE ON inventory_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON inventory_snapshots
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read" ON inventory_snapshots
  FOR SELECT
  USING (auth.role() = 'authenticated');

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

CREATE INDEX IF NOT EXISTS idx_product_mappings_sku ON product_mappings(sku);
CREATE INDEX IF NOT EXISTS idx_product_mappings_status ON product_mappings(mapping_status);
CREATE INDEX IF NOT EXISTS idx_product_mappings_odoo_id ON product_mappings(odoo_product_id);

CREATE TRIGGER update_product_mappings_updated_at
  BEFORE UPDATE ON product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON product_mappings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read" ON product_mappings
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access" ON rate_limit_entries
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
