'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import type { TestRunSummary } from '@/lib/supabase/dashboardTypes';
import { GitCompare, TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { ComparisonMetricRow } from './ComparisonMetricRow';

interface HistoricalComparisonProps {
  currentRunId: string;
}

interface ComparisonData {
  current: TestRunSummary;
  previous: TestRunSummary;
  improvements: number;
  regressions: number;
  newIssues: number;
  resolvedIssues: number;
}

export function HistoricalComparison({ currentRunId }: HistoricalComparisonProps) {
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [availableRuns, setAvailableRuns] = useState<TestRunSummary[]>([]);
  const [selectedPreviousRunId, setSelectedPreviousRunId] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableRuns();
  }, []);

  useEffect(() => {
    if (selectedPreviousRunId) {
      loadComparison();
    }
  }, [selectedPreviousRunId]);

  const loadAvailableRuns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/recent-runs?page=1&pageSize=10&status=completed');
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      const otherRuns = (result.runs as TestRunSummary[]).filter(r => r.id !== currentRunId);
      setAvailableRuns(otherRuns);

      if (otherRuns.length > 0) {
        setSelectedPreviousRunId(otherRuns[0].id);
      }
    } catch (error) {
      // Failed to load test runs - silently fail
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async () => {
    if (!selectedPreviousRunId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/dashboard/compare-runs?current=${encodeURIComponent(currentRunId)}&previous=${encodeURIComponent(selectedPreviousRunId)}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setComparison(data);
    } catch (error) {
      // Failed to load comparison - silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading && !comparison) {
    return (
      <ThemedCard variant="bordered">
        <ThemedCardContent>
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: currentTheme.colors.accent }} />
            <p style={{ color: currentTheme.colors.text.secondary }}>Loading comparison...</p>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  if (availableRuns.length === 0) {
    return (
      <ThemedCard variant="bordered">
        <ThemedCardHeader
          title="Historical Comparison"
          subtitle="Compare with previous runs"
          icon={<GitCompare className="w-5 h-5" />}
        />
        <ThemedCardContent>
          <div className="text-center py-8" style={{ color: currentTheme.colors.text.tertiary }}>
            No previous test runs available for comparison
          </div>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  return (
    <ThemedCard variant="bordered">
      <ThemedCardHeader
        title="Historical Comparison"
        subtitle="Compare with previous runs"
        icon={<GitCompare className="w-5 h-5" />}
        action={
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
              Compare with:
            </label>
            <select
              value={selectedPreviousRunId || ''}
              onChange={(e) => setSelectedPreviousRunId(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.primary,
              }}
            >
              {availableRuns.map(run => (
                <option key={run.id} value={run.id}>
                  {run.name} - {new Date(run.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        }
      />
      <ThemedCardContent>
        {comparison && (
          <div className="mt-4 space-y-6">
            {/* Comparison Header */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium mb-1" style={{ color: currentTheme.colors.text.tertiary }}>
                  Previous Run
                </div>
                <div className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                  {comparison.previous.name}
                </div>
                <div className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                  {new Date(comparison.previous.created_at).toLocaleString()}
                </div>
              </div>

              <ArrowRight className="w-8 h-8 mx-4" style={{ color: currentTheme.colors.text.tertiary }} />

              <div className="flex-1 text-right">
                <div className="text-sm font-medium mb-1" style={{ color: currentTheme.colors.text.tertiary }}>
                  Current Run
                </div>
                <div className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                  {comparison.current.name}
                </div>
                <div className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                  {new Date(comparison.current.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={TrendingUp}
                iconColor="#22c55e"
                label="Improvements"
                value={comparison.improvements}
                suffix="Tests fixed"
                backgroundColor={`${comparison.improvements > 0 ? '#22c55e' : currentTheme.colors.surface}20`}
                borderColor={comparison.improvements > 0 ? '#22c55e50' : currentTheme.colors.border}
                delay={0}
                textColor="#22c55e"
                tertiaryColor={currentTheme.colors.text.tertiary}
                testId="improvements-metric"
              />
              <MetricCard
                icon={TrendingDown}
                iconColor="#ef4444"
                label="Regressions"
                value={comparison.regressions}
                suffix="Tests broken"
                backgroundColor={`${comparison.regressions > 0 ? '#ef4444' : currentTheme.colors.surface}20`}
                borderColor={comparison.regressions > 0 ? '#ef444450' : currentTheme.colors.border}
                delay={0.05}
                textColor="#ef4444"
                tertiaryColor={currentTheme.colors.text.tertiary}
                testId="regressions-metric"
              />
              <MetricCard
                icon={TrendingUp}
                iconColor="#22c55e"
                label="Resolved Issues"
                value={comparison.resolvedIssues}
                suffix="Issues fixed"
                backgroundColor={`${comparison.resolvedIssues > 0 ? '#22c55e' : currentTheme.colors.surface}20`}
                borderColor={comparison.resolvedIssues > 0 ? '#22c55e50' : currentTheme.colors.border}
                delay={0.1}
                textColor="#22c55e"
                tertiaryColor={currentTheme.colors.text.tertiary}
                testId="resolved-issues-metric"
              />
              <MetricCard
                icon={TrendingDown}
                iconColor="#f97316"
                label="New Issues"
                value={comparison.newIssues}
                suffix="New problems"
                backgroundColor={`${comparison.newIssues > 0 ? '#f97316' : currentTheme.colors.surface}20`}
                borderColor={comparison.newIssues > 0 ? '#f9731650' : currentTheme.colors.border}
                delay={0.15}
                textColor="#f97316"
                tertiaryColor={currentTheme.colors.text.tertiary}
                testId="new-issues-metric"
              />
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Previous */}
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div className="space-y-2">
                  <ComparisonMetricRow
                    label="Total Tests"
                    value={comparison.previous.total_tests}
                    labelColor={currentTheme.colors.text.secondary}
                    valueColor={currentTheme.colors.text.primary}
                    isBold={true}
                  />
                  <ComparisonMetricRow
                    label="Passed"
                    value={comparison.previous.passed_tests}
                    labelColor={currentTheme.colors.text.secondary}
                    valueColor="#22c55e"
                    isBold={true}
                  />
                  <ComparisonMetricRow
                    label="Failed"
                    value={comparison.previous.failed_tests}
                    labelColor={currentTheme.colors.text.secondary}
                    valueColor="#ef4444"
                    isBold={true}
                  />
                  {comparison.previous.quality_score !== undefined && (
                    <ComparisonMetricRow
                      label="Quality Score"
                      value={comparison.previous.quality_score}
                      labelColor={currentTheme.colors.text.secondary}
                      valueColor={currentTheme.colors.accent}
                      isBold={true}
                    />
                  )}
                </div>
              </div>

              {/* Current */}
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${currentTheme.colors.primary}10`,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: currentTheme.colors.primary,
                }}
              >
                <div className="space-y-2">
                  <ComparisonMetricRow
                    label="Total Tests"
                    value={comparison.current.total_tests}
                    labelColor={currentTheme.colors.text.secondary}
                    valueColor={currentTheme.colors.text.primary}
                    isBold={true}
                  />
                  <ComparisonMetricRow
                    label="Passed"
                    value={comparison.current.passed_tests}
                    labelColor={currentTheme.colors.text.secondary}
                    valueColor="#22c55e"
                    isBold={true}
                  />
                  <ComparisonMetricRow
                    label="Failed"
                    value={comparison.current.failed_tests}
                    labelColor={currentTheme.colors.text.secondary}
                    valueColor="#ef4444"
                    isBold={true}
                  />
                  {comparison.current.quality_score !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                        Quality Score
                      </span>
                      <span className="font-semibold" style={{ color: currentTheme.colors.accent }}>
                        {comparison.current.quality_score}
                        {comparison.previous.quality_score !== undefined && (
                          <span className="ml-2 text-xs" style={{
                            color: comparison.current.quality_score > comparison.previous.quality_score ? '#22c55e' : '#ef4444'
                          }}>
                            ({comparison.current.quality_score > comparison.previous.quality_score ? '+' : ''}
                            {(comparison.current.quality_score - comparison.previous.quality_score).toFixed(1)})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Assessment */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: comparison.improvements > comparison.regressions && comparison.resolvedIssues > comparison.newIssues
                  ? `${' #22c55e'}10`
                  : comparison.regressions > comparison.improvements || comparison.newIssues > comparison.resolvedIssues
                  ? `${'#ef4444'}10`
                  : `${currentTheme.colors.accent}10`,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: comparison.improvements > comparison.regressions && comparison.resolvedIssues > comparison.newIssues
                  ? '#22c55e30'
                  : comparison.regressions > comparison.improvements || comparison.newIssues > comparison.resolvedIssues
                  ? '#ef444430'
                  : `${currentTheme.colors.accent}30`,
              }}
            >
              <p className="text-sm font-medium" style={{ color: currentTheme.colors.text.primary }}>
                {comparison.improvements > comparison.regressions && comparison.resolvedIssues > comparison.newIssues
                  ? '✓ Overall improvement detected'
                  : comparison.regressions > comparison.improvements || comparison.newIssues > comparison.resolvedIssues
                  ? '⚠ Potential regressions detected'
                  : 'ℹ Similar performance to previous run'}
              </p>
            </div>
          </div>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );
}
