-- Migration: Per-scenario target URL
-- Each scenario can have its own target URL; falls back to suite target_url when null

ALTER TABLE test_scenarios
ADD COLUMN IF NOT EXISTS target_url TEXT;

COMMENT ON COLUMN test_scenarios.target_url IS 'Optional URL for this scenario; overrides suite target_url when set';
