-- Migration: Suite Screenshots and Test Scenarios
-- This migration adds tables to store screenshots and AI-generated test scenarios for test suites

-- Suite Screenshots table
-- Stores metadata about screenshots captured during test suite generation
CREATE TABLE IF NOT EXISTS suite_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    viewport VARCHAR(50) NOT NULL, -- desktop, tablet, mobile
    viewport_size VARCHAR(50), -- e.g., "1920x1080"
    screenshot_url TEXT NOT NULL, -- URL in Supabase storage
    storage_path TEXT NOT NULL, -- Path in storage bucket
    captured_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test Scenarios table
-- Stores AI-generated test scenarios for test suites
CREATE TABLE IF NOT EXISTS test_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL, -- Array of test step objects
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    category VARCHAR(100), -- e.g., "authentication", "navigation", "form-submission"
    expected_outcome TEXT,
    confidence_score DECIMAL(3,2), -- AI confidence 0.00 to 1.00
    order_index INTEGER DEFAULT 0, -- For maintaining scenario order
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_suite_screenshots_suite_id ON suite_screenshots(suite_id);
CREATE INDEX IF NOT EXISTS idx_suite_screenshots_viewport ON suite_screenshots(viewport);
CREATE INDEX IF NOT EXISTS idx_test_scenarios_suite_id ON test_scenarios(suite_id);
CREATE INDEX IF NOT EXISTS idx_test_scenarios_priority ON test_scenarios(priority);
CREATE INDEX IF NOT EXISTS idx_test_scenarios_category ON test_scenarios(category);
CREATE INDEX IF NOT EXISTS idx_test_scenarios_order ON test_scenarios(suite_id, order_index);

-- Enable Row Level Security
ALTER TABLE suite_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON suite_screenshots
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON test_scenarios
    FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE suite_screenshots IS 'Screenshots captured during test suite generation/analysis';
COMMENT ON TABLE test_scenarios IS 'AI-generated test scenarios for test suites';
COMMENT ON COLUMN test_scenarios.steps IS 'JSON array of test steps: [{ step: string, action: string, selector?: string }]';
COMMENT ON COLUMN test_scenarios.confidence_score IS 'AI confidence in scenario quality (0.00-1.00)';
