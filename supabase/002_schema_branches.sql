-- Branching & Merge Workflow Extension
-- Run this migration after the main schema.sql

-- Test Suite Branches table
CREATE TABLE test_suite_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    branch_name VARCHAR(255) NOT NULL,
    parent_branch_id UUID REFERENCES test_suite_branches(id) ON DELETE SET NULL,
    is_default BOOLEAN DEFAULT false,
    description TEXT,
    created_by VARCHAR(255), -- user identifier
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(suite_id, branch_name)
);

-- Branch Snapshots (stores complete state of test suite at branch creation/merge)
CREATE TABLE branch_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES test_suite_branches(id) ON DELETE CASCADE,
    test_code_id UUID REFERENCES test_code(id) ON DELETE SET NULL,
    suite_config JSONB, -- snapshot of suite configuration
    created_at TIMESTAMP DEFAULT NOW()
);

-- Branch Diffs (tracks changes between branches)
CREATE TABLE branch_diffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_branch_id UUID REFERENCES test_suite_branches(id) ON DELETE CASCADE,
    target_branch_id UUID REFERENCES test_suite_branches(id) ON DELETE CASCADE,
    diff_type VARCHAR(50) NOT NULL, -- 'code', 'config', 'steps'
    changes JSONB NOT NULL, -- structured diff data
    created_at TIMESTAMP DEFAULT NOW()
);

-- Merge Requests table
CREATE TABLE merge_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    source_branch_id UUID REFERENCES test_suite_branches(id) ON DELETE CASCADE,
    target_branch_id UUID REFERENCES test_suite_branches(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'open', -- open, merged, closed, conflict
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255),
    merged_by VARCHAR(255),
    conflicts JSONB, -- stores detected conflicts
    resolution JSONB, -- stores conflict resolution choices
    created_at TIMESTAMP DEFAULT NOW(),
    merged_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Merge History (audit trail of merges)
CREATE TABLE merge_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merge_request_id UUID REFERENCES merge_requests(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'resolved_conflict', 'merged', 'closed'
    actor VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_branches_suite_id ON test_suite_branches(suite_id);
CREATE INDEX idx_branches_parent_id ON test_suite_branches(parent_branch_id);
CREATE INDEX idx_branches_default ON test_suite_branches(suite_id, is_default);
CREATE INDEX idx_snapshots_branch_id ON branch_snapshots(branch_id);
CREATE INDEX idx_diffs_source_branch ON branch_diffs(source_branch_id);
CREATE INDEX idx_diffs_target_branch ON branch_diffs(target_branch_id);
CREATE INDEX idx_merge_requests_suite ON merge_requests(suite_id);
CREATE INDEX idx_merge_requests_status ON merge_requests(status);
CREATE INDEX idx_merge_history_request ON merge_history(merge_request_id);

-- Add updated_at triggers
CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON test_suite_branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merge_requests_updated_at
    BEFORE UPDATE ON merge_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE test_suite_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_diffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE merge_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for authenticated users" ON test_suite_branches
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON branch_snapshots
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON branch_diffs
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON merge_requests
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON merge_history
    FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE test_suite_branches IS 'Git-like branches for test suites';
COMMENT ON TABLE branch_snapshots IS 'Snapshots of test suite state at specific points';
COMMENT ON TABLE branch_diffs IS 'Diff calculations between branches';
COMMENT ON TABLE merge_requests IS 'Merge requests with conflict tracking';
COMMENT ON TABLE merge_history IS 'Audit trail of merge operations';
