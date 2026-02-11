-- Migration: Dashboard Aggregation Functions
-- Purpose: Move quality metrics aggregation to database level for performance
-- Date: 2025-01-15

-- Add quality_score to ai_analyses if not present (used by dashboard aggregations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ai_analyses' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE ai_analyses ADD COLUMN quality_score NUMERIC;
  END IF;
END $$;

-- Function to get aggregated dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(
  days_back INTEGER DEFAULT 30,
  offset_days INTEGER DEFAULT 0
)
RETURNS TABLE(
  total_tests BIGINT,
  passed_tests BIGINT,
  failed_tests BIGINT,
  pass_rate NUMERIC,
  total_issues BIGINT,
  recent_test_runs BIGINT,
  avg_quality_score NUMERIC,
  coverage NUMERIC
) AS $$
DECLARE
  cutoff_date TIMESTAMP;
  end_date TIMESTAMP;
BEGIN
  -- Calculate date range
  cutoff_date := NOW() - (days_back + offset_days) * INTERVAL '1 day';
  end_date := NOW() - offset_days * INTERVAL '1 day';

  RETURN QUERY
  WITH test_runs_in_period AS (
    SELECT id, status, created_at
    FROM test_runs
    WHERE created_at >= cutoff_date
      AND created_at <= end_date
  ),
  completed_runs AS (
    SELECT id
    FROM test_runs_in_period
    WHERE status = 'completed'
  ),
  test_results_agg AS (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE tr.status = 'pass') as passed,
      COUNT(*) FILTER (WHERE tr.status = 'fail') as failed
    FROM test_results tr
    INNER JOIN completed_runs cr ON tr.run_id = cr.id
  ),
  quality_scores AS (
    SELECT aa.quality_score
    FROM ai_analyses aa
    INNER JOIN test_results tr ON aa.result_id = tr.id
    INNER JOIN completed_runs cr ON tr.run_id = cr.id
    WHERE aa.quality_score IS NOT NULL
  ),
  issues_count AS (
    SELECT COUNT(*) as total_issues
    FROM ai_analyses aa
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(aa.findings, '[]'::jsonb)) as finding
    WHERE aa.created_at >= cutoff_date
      AND aa.created_at <= end_date
  )
  SELECT
    COALESCE(tra.total, 0)::BIGINT as total_tests,
    COALESCE(tra.passed, 0)::BIGINT as passed_tests,
    COALESCE(tra.failed, 0)::BIGINT as failed_tests,
    CASE
      WHEN COALESCE(tra.total, 0) > 0
      THEN ROUND((COALESCE(tra.passed, 0)::NUMERIC / tra.total::NUMERIC) * 100, 1)
      ELSE 0
    END as pass_rate,
    COALESCE(ic.total_issues, 0)::BIGINT as total_issues,
    (SELECT COUNT(*) FROM test_runs_in_period)::BIGINT as recent_test_runs,
    COALESCE(ROUND((SELECT AVG(quality_score) FROM quality_scores), 1), 0) as avg_quality_score,
    85.0 as coverage -- Placeholder, can be computed if coverage data exists
  FROM test_results_agg tra, issues_count ic;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get quality trends over time
CREATE OR REPLACE FUNCTION get_quality_trends(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  test_run_id UUID,
  quality_score NUMERIC,
  pass_rate NUMERIC
) AS $$
DECLARE
  cutoff_date TIMESTAMP;
BEGIN
  cutoff_date := NOW() - days_back * INTERVAL '1 day';

  RETURN QUERY
  WITH completed_runs AS (
    SELECT tr.id, tr.created_at
    FROM test_runs tr
    WHERE tr.status = 'completed'
      AND tr.created_at >= cutoff_date
    ORDER BY tr.created_at ASC
  ),
  run_metrics AS (
    SELECT
      cr.id as run_id,
      cr.created_at::DATE as run_date,
      COUNT(tr.*) as total_tests,
      COUNT(*) FILTER (WHERE tr.status = 'pass') as passed_tests,
      (
        SELECT AVG(aa.quality_score)
        FROM ai_analyses aa
        INNER JOIN test_results tr2 ON aa.result_id = tr2.id
        WHERE tr2.run_id = cr.id
          AND aa.quality_score IS NOT NULL
      ) as avg_quality_score
    FROM completed_runs cr
    LEFT JOIN test_results tr ON tr.run_id = cr.id
    GROUP BY cr.id, cr.created_at
  )
  SELECT
    rm.run_date as date,
    rm.run_id as test_run_id,
    COALESCE(ROUND(rm.avg_quality_score, 1), 0) as quality_score,
    CASE
      WHEN rm.total_tests > 0
      THEN ROUND((rm.passed_tests::NUMERIC / rm.total_tests::NUMERIC) * 100, 1)
      ELSE 0
    END as pass_rate
  FROM run_metrics rm
  ORDER BY rm.run_date ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get recent test runs with aggregated metrics
CREATE OR REPLACE FUNCTION get_recent_test_runs(
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10,
  status_filter VARCHAR DEFAULT NULL,
  min_quality_score NUMERIC DEFAULT NULL,
  date_from TIMESTAMP DEFAULT NULL,
  date_to TIMESTAMP DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  suite_name VARCHAR,
  created_at TIMESTAMP,
  status VARCHAR,
  total_tests BIGINT,
  passed_tests BIGINT,
  failed_tests BIGINT,
  duration_ms INTEGER,
  quality_score NUMERIC,
  issue_count BIGINT,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (page_num - 1) * page_size;

  RETURN QUERY
  WITH filtered_runs AS (
    SELECT tr.id, tr.suite_name, tr.created_at, tr.status, tr.duration_ms
    FROM test_runs tr
    WHERE (status_filter IS NULL OR tr.status = status_filter)
      AND (date_from IS NULL OR tr.created_at >= date_from)
      AND (date_to IS NULL OR tr.created_at <= date_to)
    ORDER BY tr.created_at DESC
    LIMIT page_size
    OFFSET offset_val
  ),
  run_metrics AS (
    SELECT
      fr.id,
      fr.suite_name,
      fr.created_at,
      fr.status,
      fr.duration_ms,
      COUNT(tr.*) as total_tests,
      COUNT(*) FILTER (WHERE tr.status = 'pass') as passed_tests,
      COUNT(*) FILTER (WHERE tr.status = 'fail') as failed_tests,
      (
        SELECT AVG(aa.quality_score)
        FROM ai_analyses aa
        INNER JOIN test_results tr2 ON aa.result_id = tr2.id
        WHERE tr2.run_id = fr.id
          AND aa.quality_score IS NOT NULL
      ) as avg_quality_score,
      (
        SELECT COUNT(*)
        FROM ai_analyses aa
        INNER JOIN test_results tr2 ON aa.result_id = tr2.id
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(aa.findings, '[]'::jsonb)) as finding
        WHERE tr2.run_id = fr.id
      ) as issue_count
    FROM filtered_runs fr
    LEFT JOIN test_results tr ON tr.run_id = fr.id
    GROUP BY fr.id, fr.suite_name, fr.created_at, fr.status, fr.duration_ms
  ),
  total_count_cte AS (
    SELECT COUNT(*) as total
    FROM test_runs tr
    WHERE (status_filter IS NULL OR tr.status = status_filter)
      AND (date_from IS NULL OR tr.created_at >= date_from)
      AND (date_to IS NULL OR tr.created_at <= date_to)
  )
  SELECT
    rm.id,
    COALESCE(rm.suite_name, 'Test Run #' || SUBSTRING(rm.id::TEXT, 1, 8))::VARCHAR as suite_name,
    rm.created_at,
    rm.status::VARCHAR,
    rm.total_tests::BIGINT,
    rm.passed_tests::BIGINT,
    rm.failed_tests::BIGINT,
    COALESCE(rm.duration_ms, 0)::INTEGER,
    ROUND(COALESCE(rm.avg_quality_score, 0), 1) as quality_score,
    COALESCE(rm.issue_count, 0)::BIGINT,
    (SELECT total FROM total_count_cte)::BIGINT as total_count
  FROM run_metrics rm
  WHERE (min_quality_score IS NULL OR COALESCE(rm.avg_quality_score, 0) >= min_quality_score)
  ORDER BY rm.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get issues grouped by category
CREATE OR REPLACE FUNCTION get_issues_by_category(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  category VARCHAR,
  count BIGINT,
  critical BIGINT,
  warning BIGINT,
  info BIGINT
) AS $$
DECLARE
  cutoff_date TIMESTAMP;
BEGIN
  cutoff_date := NOW() - days_back * INTERVAL '1 day';

  RETURN QUERY
  WITH findings_expanded AS (
    SELECT
      finding->>'category' as category,
      finding->>'severity' as severity
    FROM ai_analyses aa
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(aa.findings, '[]'::jsonb)) as finding
    WHERE aa.created_at >= cutoff_date
  )
  SELECT
    COALESCE(fe.category, 'unknown')::VARCHAR,
    COUNT(*)::BIGINT as count,
    COUNT(*) FILTER (WHERE fe.severity = 'critical')::BIGINT as critical,
    COUNT(*) FILTER (WHERE fe.severity = 'warning')::BIGINT as warning,
    COUNT(*) FILTER (WHERE fe.severity = 'info')::BIGINT as info
  FROM findings_expanded fe
  GROUP BY fe.category
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments for documentation
COMMENT ON FUNCTION get_dashboard_stats IS 'Returns aggregated dashboard statistics for a given time period';
COMMENT ON FUNCTION get_quality_trends IS 'Returns quality trends over time with pass rates';
COMMENT ON FUNCTION get_recent_test_runs IS 'Returns paginated recent test runs with aggregated metrics';
COMMENT ON FUNCTION get_issues_by_category IS 'Returns issues grouped by category with severity counts';

-- Create indexes to optimize the aggregation queries
CREATE INDEX IF NOT EXISTS idx_test_runs_created_at ON test_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_quality_score ON ai_analyses(quality_score) WHERE quality_score IS NOT NULL;
