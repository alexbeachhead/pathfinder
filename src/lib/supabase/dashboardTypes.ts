/** Dashboard types only – safe to import from client (no Supabase). */

export interface DashboardStats {
  totalTests: number;
  passRate: number;
  totalIssues: number;
  coverage: number;
  recentTestRuns: number;
  avgQualityScore: number;
}

export interface TestRunSummary {
  id: string;
  name: string;
  created_at: string;
  status: 'running' | 'completed' | 'failed';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  duration_ms: number;
  quality_score?: number;
  issue_count?: number;
}

export interface QualityTrendPoint {
  date: string;
  quality_score: number;
  test_run_id: string;
  pass_rate: number;
}

export interface IssuesByCategory {
  category: string;
  count: number;
  critical: number;
  warning: number;
  info: number;
}
