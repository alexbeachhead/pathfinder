-- Plugin System Database Schema

-- Table: installed_plugins
-- Stores user-installed plugins
CREATE TABLE IF NOT EXISTS installed_plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id TEXT NOT NULL,
  plugin_action JSONB NOT NULL, -- Full PluginAction object
  enabled BOOLEAN DEFAULT true,
  install_source TEXT CHECK (install_source IN ('marketplace', 'local', 'registry')),
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: plugin_registries
-- Stores configured plugin registries (marketplace URLs)
CREATE TABLE IF NOT EXISTS plugin_registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  credentials JSONB, -- For authenticated registries
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: plugin_usage_stats
-- Tracks plugin usage for analytics
CREATE TABLE IF NOT EXISTS plugin_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id TEXT NOT NULL,
  suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_installed_plugins_plugin_id ON installed_plugins(plugin_id);
CREATE INDEX IF NOT EXISTS idx_installed_plugins_enabled ON installed_plugins(enabled);
CREATE INDEX IF NOT EXISTS idx_plugin_registries_enabled ON plugin_registries(enabled);
CREATE INDEX IF NOT EXISTS idx_plugin_usage_stats_plugin_id ON plugin_usage_stats(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_usage_stats_suite_id ON plugin_usage_stats(suite_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_installed_plugins_updated_at
  BEFORE UPDATE ON installed_plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample default registry
INSERT INTO plugin_registries (name, description, url, enabled)
VALUES (
  'Pathfinder Official Registry',
  'Official plugin registry for Pathfinder test automation platform',
  'https://plugins.pathfinder.dev/api/registry',
  true
)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE installed_plugins IS 'Stores plugins installed by users';
COMMENT ON TABLE plugin_registries IS 'Stores plugin registry/marketplace configurations';
COMMENT ON TABLE plugin_usage_stats IS 'Tracks plugin usage analytics';

COMMENT ON COLUMN installed_plugins.plugin_action IS 'Full PluginAction object including metadata, parameters, and code generator info';
COMMENT ON COLUMN plugin_registries.credentials IS 'Authentication credentials for private registries (stored as JSON)';
