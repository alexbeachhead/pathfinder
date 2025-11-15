-- Test Run Queue System
-- Manages queued test runs with retry logic and concurrency control

CREATE TABLE IF NOT EXISTS test_run_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    config JSONB NOT NULL, -- viewport settings, etc.
    priority INTEGER DEFAULT 0, -- higher = executed first
    status VARCHAR(50) DEFAULT 'queued', -- queued, running, completed, failed, retrying, cancelled
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 2,
    run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL, -- linked to actual test run when executing
    error_message TEXT,
    scheduled_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Queue metadata for concurrency control
CREATE TABLE IF NOT EXISTS queue_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default concurrency limit
INSERT INTO queue_metadata (key, value)
VALUES ('concurrency_limit', '3'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_queue_status ON test_run_queue(status);
CREATE INDEX idx_queue_priority ON test_run_queue(priority DESC, created_at ASC);
CREATE INDEX idx_queue_suite_id ON test_run_queue(suite_id);
CREATE INDEX idx_queue_scheduled_at ON test_run_queue(scheduled_at);

-- Updated_at trigger for queue
CREATE TRIGGER update_queue_updated_at
    BEFORE UPDATE ON test_run_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for metadata
CREATE TRIGGER update_queue_metadata_updated_at
    BEFORE UPDATE ON queue_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE test_run_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for authenticated users" ON test_run_queue
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON queue_metadata
    FOR ALL USING (true);

-- Comments
COMMENT ON TABLE test_run_queue IS 'Queue for managing test run executions with retry logic';
COMMENT ON TABLE queue_metadata IS 'Metadata for queue configuration (concurrency limits, etc.)';
COMMENT ON COLUMN test_run_queue.priority IS 'Higher priority jobs execute first';
COMMENT ON COLUMN test_run_queue.retry_count IS 'Number of times this job has been retried';
COMMENT ON COLUMN test_run_queue.max_retries IS 'Maximum retry attempts before marking as failed';
