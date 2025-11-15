-- Migration: Add Test Projects feature
-- Description: Introduces Test Projects table to organize test suites by repository/project
-- Date: 2025-11-15
-- Note: Using test_projects to avoid conflict with existing projects table

-- Create Test Projects table
CREATE TABLE IF NOT EXISTS test_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    repo TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add project_id to test_suites table (optional foreign key)
ALTER TABLE test_suites
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES test_projects(id) ON DELETE SET NULL;

-- Create index for project_id in test_suites
CREATE INDEX IF NOT EXISTS idx_test_suites_project_id ON test_suites(project_id);

-- Add trigger to update updated_at for test_projects
CREATE TRIGGER update_test_projects_updated_at
    BEFORE UPDATE ON test_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for test_projects
ALTER TABLE test_projects ENABLE ROW LEVEL SECURITY;

-- Create policy for test_projects (allowing all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON test_projects
    FOR ALL USING (true);

-- Add comment for documentation
COMMENT ON TABLE test_projects IS 'Organizes test suites by project/repository for testing purposes';
COMMENT ON COLUMN test_suites.project_id IS 'Optional foreign key to associate test suite with a test project';

-- Insert example test project
INSERT INTO test_projects (name, repo, description)
VALUES (
    'Genesis',
    'https://github.com/xkazm04/pathfinder',
    'Let us make mankind in our image'
);
