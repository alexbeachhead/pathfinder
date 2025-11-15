-- Migration: Add root-cause analysis tables for AI-powered test failure debugging

-- Table to store failure embeddings for similarity search
CREATE TABLE IF NOT EXISTS test_failure_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
  error_message TEXT,
  stack_trace TEXT,
  embedding vector(1536), -- OpenAI ada-002 embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store AI-generated root cause analyses
CREATE TABLE IF NOT EXISTS root_cause_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
  probable_causes JSONB, -- Array of probable causes with confidence scores
  remediation_suggestions JSONB, -- Array of suggested fixes
  similar_failures JSONB, -- Array of similar past failures with their resolutions
  ai_model TEXT DEFAULT 'gpt-4',
  confidence_score FLOAT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track failure resolutions for learning
CREATE TABLE IF NOT EXISTS failure_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
  root_cause TEXT,
  solution_applied TEXT,
  resolution_notes TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_failure_embeddings_result_id ON test_failure_embeddings(result_id);
CREATE INDEX IF NOT EXISTS idx_root_cause_analyses_result_id ON root_cause_analyses(result_id);
CREATE INDEX IF NOT EXISTS idx_failure_resolutions_result_id ON failure_resolutions(result_id);

-- Index for vector similarity search (requires pgvector extension)
-- CREATE INDEX IF NOT EXISTS idx_failure_embeddings_vector ON test_failure_embeddings USING ivfflat (embedding vector_cosine_ops);

COMMENT ON TABLE test_failure_embeddings IS 'Stores embeddings of test failure logs and stack traces for similarity-based retrieval';
COMMENT ON TABLE root_cause_analyses IS 'AI-generated root cause analyses for test failures';
COMMENT ON TABLE failure_resolutions IS 'Tracks how failures were resolved to improve future analyses';
