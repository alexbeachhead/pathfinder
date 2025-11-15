-- PostgreSQL function for vector similarity search
-- This requires the pgvector extension to be enabled

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to find similar test failures using cosine similarity
-- This function searches for failures with similar embeddings
CREATE OR REPLACE FUNCTION find_similar_failures(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  result_id uuid,
  test_name text,
  error_message text,
  similarity float,
  resolution text,
  resolved_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tfe.result_id,
    tr.test_name,
    tfe.error_message,
    1 - (tfe.embedding <=> query_embedding) as similarity,
    fr.solution_applied as resolution,
    fr.resolved_at
  FROM test_failure_embeddings tfe
  INNER JOIN test_results tr ON tr.id = tfe.result_id
  LEFT JOIN failure_resolutions fr ON fr.result_id = tfe.result_id
  WHERE 1 - (tfe.embedding <=> query_embedding) > match_threshold
  ORDER BY tfe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create index for faster vector similarity search
-- Using ivfflat index with cosine distance
-- Note: You may need to adjust lists parameter based on your dataset size
-- Rule of thumb: lists = rows / 1000 for up to 1M rows
CREATE INDEX IF NOT EXISTS idx_failure_embeddings_vector
ON test_failure_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Grant execute permission on the function
-- Adjust this based on your database user setup
-- GRANT EXECUTE ON FUNCTION find_similar_failures TO authenticated;

COMMENT ON FUNCTION find_similar_failures IS 'Finds similar test failures using vector cosine similarity search';
