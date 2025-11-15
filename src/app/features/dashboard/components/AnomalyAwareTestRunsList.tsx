'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { useNavigation } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { getRecentTestRuns, type TestRunSummary } from '@/lib/supabase/dashboard';
import { useAnomalyDetection } from '@/lib/anomaly-detection/hooks';
import { List, Filter, ChevronLeft, ChevronRight, Eye, Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export function AnomalyAwareTestRunsList() {
  const { currentTheme } = useTheme();
  const { setCurrentPage, setReportId } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<TestRunSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const navigateToReports = (runId: string) => {
    setReportId(runId);
    setCurrentPage('reports');
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [minQualityScore, setMinQualityScore] = useState<number | undefined>(undefined);
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  useEffect(() => {
    loadRuns();
  }, [page, statusFilter, minQualityScore]);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (minQualityScore !== undefined) filters.minQualityScore = minQualityScore;

      const result = await getRecentTestRuns(page, pageSize, filters);
      setRuns(result.runs);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load test runs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch anomaly data for current runs
  const runIds = runs.map(r => r.id);
  const { anomalies, loading: anomaliesLoading } = useAnomalyDetection(runIds, runIds.length > 0);

  // Filter runs by anomaly status if enabled
  const filteredRuns = showAnomaliesOnly
    ? runs.filter(run => anomalies[run.id]?.isAnomalous)
    : runs;

  const totalPages = Math.ceil(total / pageSize);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'failed':
        return '#ef4444';
      case 'running':
        return currentTheme.colors.accent;
      default:
        return currentTheme.colors.text.tertiary;
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  const getAnomalyTypeLabel = (type?: string) => {
    switch (type) {
      case 'flaky_test':
        return 'Flaky';
      case 'environment_issue':
        return 'Env Issue';
      case 'regression':
        return 'Regression';
      case 'unusual_failure_pattern':
        return 'Unusual';
      default:
        return 'Anomaly';
    }
  };

  return (
    <ThemedCard variant="bordered">
      <ThemedCardHeader
        title="All Test Runs"
        subtitle={`${total} total runs • ${anomaliesLoading ? 'Analyzing...' : `${Object.values(anomalies).filter(a => a.isAnomalous).length} anomalies detected`}`}
        icon={<List className="w-5 h-5" />}
        action={
          <div className="flex gap-2">
            <ThemedButton
              variant={showAnomaliesOnly ? "primary" : "ghost"}
              size="sm"
              leftIcon={<AlertTriangle className="w-4 h-4" />}
              onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
            >
              {showAnomaliesOnly ? 'Show All' : 'Anomalies Only'}
            </ThemedButton>
            <ThemedButton
              variant="ghost"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => {
                setStatusFilter('all');
                setMinQualityScore(undefined);
                setShowAnomaliesOnly(false);
              }}
            >
              Clear Filters
            </ThemedButton>
          </div>
        }
      />
      <ThemedCardContent>
        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-4 pb-4" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: currentTheme.colors.border }}>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: currentTheme.colors.text.tertiary }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.primary,
              }}
              data-testid="status-filter"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: currentTheme.colors.text.tertiary }}>
              Min Quality Score
            </label>
            <select
              value={minQualityScore || 'all'}
              onChange={(e) => {
                const value = e.target.value === 'all' ? undefined : parseInt(e.target.value);
                setMinQualityScore(value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.primary,
              }}
              data-testid="quality-filter"
            >
              <option value="all">Any Score</option>
              <option value="80">80+</option>
              <option value="60">60+</option>
              <option value="40">40+</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: currentTheme.colors.accent }} />
              <p style={{ color: currentTheme.colors.text.secondary }}>Loading test runs...</p>
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="text-center py-12" style={{ color: currentTheme.colors.text.tertiary }}>
              {showAnomaliesOnly ? 'No anomalies detected in current runs' : 'No test runs found'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: currentTheme.colors.border }}>
                  <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    NAME
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    STATUS
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    ANOMALY
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    TESTS
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    PASS RATE
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    QUALITY
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    DURATION
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    DATE
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold" style={{ color: currentTheme.colors.text.tertiary }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run, index) => {
                  const statusColor = getStatusColor(run.status);
                  const passRate = run.total_tests > 0 ? (run.passed_tests / run.total_tests) * 100 : 0;
                  const qualityColor = run.quality_score ? getQualityScoreColor(run.quality_score) : currentTheme.colors.text.tertiary;
                  const anomaly = anomalies[run.id];

                  return (
                    <motion.tr
                      key={run.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="transition-colors hover:bg-opacity-50"
                      style={{
                        borderBottomWidth: '1px',
                        borderBottomStyle: 'solid',
                        borderBottomColor: currentTheme.colors.border,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${currentTheme.colors.primary}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium" style={{ color: currentTheme.colors.text.primary }}>
                          {run.name}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span style={{ color: statusColor }}>
                            {getStatusIcon(run.status)}
                          </span>
                          <span className="text-sm capitalize" style={{ color: statusColor }}>
                            {run.status}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {anomaliesLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: currentTheme.colors.text.tertiary }} />
                        ) : anomaly?.isAnomalous ? (
                          <div className="group relative inline-block">
                            <span
                              className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 cursor-help"
                              style={{
                                backgroundColor: '#ef444415',
                                color: '#ef4444',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: '#ef444430',
                              }}
                              data-testid={`anomaly-indicator-${run.id}`}
                              title={anomaly.explanation}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {getAnomalyTypeLabel(anomaly.anomalyType)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                            -
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                          <span style={{ color: '#22c55e' }}>{run.passed_tests}</span>
                          {' / '}
                          <span style={{ color: '#ef4444' }}>{run.failed_tests}</span>
                          {' / '}
                          <span>{run.total_tests}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${currentTheme.colors.border}` }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${passRate}%`,
                                backgroundColor: passRate >= 80 ? '#22c55e' : passRate >= 60 ? '#eab308' : '#ef4444',
                              }}
                            />
                          </div>
                          <span className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                            {passRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {run.quality_score !== undefined ? (
                          <span className="text-sm font-semibold" style={{ color: qualityColor }}>
                            {run.quality_score}
                          </span>
                        ) : (
                          <span className="text-sm" style={{ color: currentTheme.colors.text.tertiary }}>
                            -
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                          {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : '-'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-sm" style={{ color: currentTheme.colors.text.tertiary }}>
                          {new Date(run.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <ThemedButton
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => navigateToReports(run.id)}
                          data-testid={`view-run-btn-${run.id}`}
                        >
                          View
                        </ThemedButton>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm" style={{ color: currentTheme.colors.text.tertiary }}>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <ThemedButton
                variant="secondary"
                size="sm"
                leftIcon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                data-testid="prev-page-btn"
              >
                Previous
              </ThemedButton>
              <ThemedButton
                variant="secondary"
                size="sm"
                rightIcon={<ChevronRight className="w-4 h-4" />}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                data-testid="next-page-btn"
              >
                Next
              </ThemedButton>
            </div>
          </div>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );
}
