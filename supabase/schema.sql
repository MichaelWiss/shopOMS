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
CREATE INDEX idx_sync_events_status ON sync_events(status);
CREATE INDEX idx_sync_events_type ON sync_events(type);
CREATE INDEX idx_sync_events_created_at ON sync_events(created_at DESC);
CREATE INDEX idx_sync_events_shopify_id ON sync_events(shopify_id);
CREATE INDEX idx_sync_events_retry ON sync_events(status, next_retry_at) WHERE status = 'retry';

-- Composite index for filtering
CREATE INDEX idx_sync_events_type_status_date ON sync_events(type, status, created_at DESC);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

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

-- View for stats
CREATE OR REPLACE VIEW sync_stats AS
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
