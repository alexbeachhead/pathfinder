-- CI/CD Configuration Storage Schema
-- Stores CI pipeline configurations generated for test suites

-- Table: ci_configurations
-- Stores generated CI/CD pipeline configurations
CREATE TABLE IF NOT EXISTS ci_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,

  -- CI Provider
  provider TEXT NOT NULL CHECK (provider IN ('github', 'gitlab')),

  -- Configuration Details
  node_version TEXT DEFAULT '20',
  playwright_version TEXT DEFAULT '1.56',
  code_language TEXT NOT NULL CHECK (code_language IN ('javascript', 'typescript')),

  -- Browser Configuration
  browsers JSONB DEFAULT '["chromium"]'::jsonb,

  -- Execution Configuration
  workers INTEGER DEFAULT 1 CHECK (workers > 0 AND workers <= 10),
  retries INTEGER DEFAULT 2 CHECK (retries >= 0 AND retries <= 5),

  -- GitHub-specific Configuration
  run_on_push BOOLEAN DEFAULT true,
  run_on_pull_request BOOLEAN DEFAULT true,
  branches JSONB DEFAULT '["main", "master", "develop"]'::jsonb,
  schedule TEXT, -- Cron expression for scheduled runs

  -- Deployment Details
  deployed BOOLEAN DEFAULT false,
  deployed_at TIMESTAMPTZ,
  deployment_method TEXT CHECK (deployment_method IN ('api', 'manual', 'zip')),
  repository_url TEXT,
  commit_sha TEXT,

  -- Metadata
  generated_files JSONB, -- Array of generated file paths
  configuration_hash TEXT, -- Hash of configuration for change detection

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups by suite_id
CREATE INDEX IF NOT EXISTS idx_ci_configurations_suite_id ON ci_configurations(suite_id);

-- Index for filtering by provider
CREATE INDEX IF NOT EXISTS idx_ci_configurations_provider ON ci_configurations(provider);

-- Index for finding deployed configurations
CREATE INDEX IF NOT EXISTS idx_ci_configurations_deployed ON ci_configurations(deployed);

-- Table: ci_deployment_logs
-- Stores deployment history and logs for CI configurations
CREATE TABLE IF NOT EXISTS ci_deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ci_config_id UUID NOT NULL REFERENCES ci_configurations(id) ON DELETE CASCADE,

  -- Deployment Details
  deployment_status TEXT NOT NULL CHECK (deployment_status IN ('pending', 'in_progress', 'success', 'failed')),
  deployment_method TEXT NOT NULL CHECK (deployment_method IN ('api', 'manual', 'zip')),

  -- GitHub API specific
  github_repo TEXT,
  github_branch TEXT,
  commit_sha TEXT,
  commit_url TEXT,

  -- Error Information
  error_message TEXT,
  error_details JSONB,

  -- Metadata
  deployed_by TEXT, -- User identifier
  deployment_duration_ms INTEGER,
  files_deployed JSONB, -- Array of deployed file paths

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Index for faster lookups by config_id
CREATE INDEX IF NOT EXISTS idx_ci_deployment_logs_config_id ON ci_deployment_logs(ci_config_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_ci_deployment_logs_status ON ci_deployment_logs(deployment_status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ci_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_ci_configurations_updated_at
  BEFORE UPDATE ON ci_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_ci_configurations_updated_at();

-- RLS Policies (assuming similar to test_suites)
-- Note: Adjust these based on your authentication setup

-- Enable RLS
ALTER TABLE ci_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_deployment_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (customize based on your auth setup)
CREATE POLICY "Allow all operations on ci_configurations"
  ON ci_configurations
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on ci_deployment_logs"
  ON ci_deployment_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Helper function to get CI configuration for a test suite
CREATE OR REPLACE FUNCTION get_latest_ci_config(p_suite_id UUID, p_provider TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  suite_id UUID,
  provider TEXT,
  node_version TEXT,
  code_language TEXT,
  browsers JSONB,
  workers INTEGER,
  retries INTEGER,
  deployed BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.suite_id,
    cc.provider,
    cc.node_version,
    cc.code_language,
    cc.browsers,
    cc.workers,
    cc.retries,
    cc.deployed,
    cc.created_at
  FROM ci_configurations cc
  WHERE cc.suite_id = p_suite_id
    AND (p_provider IS NULL OR cc.provider = p_provider)
  ORDER BY cc.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get deployment history for a CI configuration
CREATE OR REPLACE FUNCTION get_deployment_history(p_ci_config_id UUID)
RETURNS TABLE (
  id UUID,
  deployment_status TEXT,
  deployment_method TEXT,
  github_repo TEXT,
  commit_sha TEXT,
  commit_url TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dl.id,
    dl.deployment_status,
    dl.deployment_method,
    dl.github_repo,
    dl.commit_sha,
    dl.commit_url,
    dl.error_message,
    dl.started_at,
    dl.completed_at
  FROM ci_deployment_logs dl
  WHERE dl.ci_config_id = p_ci_config_id
  ORDER BY dl.started_at DESC;
END;
$$ LANGUAGE plpgsql;
