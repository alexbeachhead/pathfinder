'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { TestResultWithDetails } from '../lib/mockData';
import { CheckCircle2, XCircle, Minus, Monitor, Tablet, Smartphone, AlertCircle, ExternalLink, Brain } from 'lucide-react';
import { CreateTicketModal } from './CreateTicketModal';
import { RootCauseAnalysisModal } from './RootCauseAnalysisModal';
import { IssueTrackerType } from '@/lib/issueTrackers/types';
import { TestResult } from '@/lib/types';

interface TestResultsTableProps {
  results: TestResultWithDetails[];
  testSuiteName?: string;
  targetUrl?: string;
}

interface TicketLink {
  resultId: string;
  ticketUrl: string;
  ticketKey: string;
  trackerType: IssueTrackerType;
}

// Helper functions extracted for reusability
const getStatusIcon = (status: 'pass' | 'fail' | 'skipped') => {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />;
    case 'fail':
      return <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />;
    case 'skipped':
      return <Minus className="w-4 h-4" style={{ color: '#6b7280' }} />;
  }
};

const getStatusColor = (status: 'pass' | 'fail' | 'skipped') => {
  switch (status) {
    case 'pass':
      return '#22c55e';
    case 'fail':
      return '#ef4444';
    case 'skipped':
      return '#6b7280';
  }
};

const getViewportIcon = (viewport: 'mobile' | 'tablet' | 'desktop') => {
  switch (viewport) {
    case 'desktop':
      return <Monitor className="w-4 h-4" />;
    case 'tablet':
      return <Tablet className="w-4 h-4" />;
    case 'mobile':
      return <Smartphone className="w-4 h-4" />;
  }
};

const formatDuration = (ms?: number) => {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export function TestResultsTable({ results, testSuiteName = 'Test Suite', targetUrl = 'https://example.com' }: TestResultsTableProps) {
  const { currentTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResultWithDetails | null>(null);
  const [ticketLinks, setTicketLinks] = useState<TicketLink[]>([]);
  const [isRootCauseModalOpen, setIsRootCauseModalOpen] = useState(false);
  const [selectedFailureResult, setSelectedFailureResult] = useState<TestResultWithDetails | null>(null);

  const handleCreateTicket = (result: TestResultWithDetails) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const handleAnalyzeRootCause = (result: TestResultWithDetails) => {
    setSelectedFailureResult(result);
    setIsRootCauseModalOpen(true);
  };

  const handleTicketCreated = (ticketUrl: string, ticketKey: string, trackerType: IssueTrackerType) => {
    if (selectedResult) {
      setTicketLinks([
        ...ticketLinks,
        {
          resultId: selectedResult.id,
          ticketUrl,
          ticketKey,
          trackerType,
        },
      ]);
    }
  };

  const getTicketForResult = (resultId: string): TicketLink | undefined => {
    return ticketLinks.find((link) => link.resultId === resultId);
  };

  // Group results by test name
  const groupedResults = results.reduce((acc, result) => {
    const key = result.test_name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, TestResultWithDetails[]>);

  return (
    <ThemedCard variant="bordered">
      <ThemedCardHeader
        title="Test Results"
        subtitle={`${results.length} test execution${results.length !== 1 ? 's' : ''}`}
        icon={<CheckCircle2 className="w-5 h-5" />}
      />
      <ThemedCardContent>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  borderBottomWidth: '2px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: currentTheme.colors.border,
                }}
              >
                <th className="text-left p-3 text-xs font-semibold"
                  style={{ color: currentTheme.colors.text.tertiary }}
                >
                  Test Name
                </th>
                <th className="text-center p-3 text-xs font-semibold"
                  style={{ color: currentTheme.colors.text.tertiary }}
                >
                  Viewport
                </th>
                <th className="text-center p-3 text-xs font-semibold"
                  style={{ color: currentTheme.colors.text.tertiary }}
                >
                  Status
                </th>
                <th className="text-center p-3 text-xs font-semibold"
                  style={{ color: currentTheme.colors.text.tertiary }}
                >
                  Duration
                </th>
                <th className="text-center p-3 text-xs font-semibold"
                  style={{ color: currentTheme.colors.text.tertiary }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedResults).map(([testName, testResults], groupIndex) => (
                <motion.tr
                  key={testName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
                >
                  <td
                    colSpan={5}
                    className="p-0"
                    style={{
                      borderTopWidth: groupIndex > 0 ? '1px' : '0',
                      borderTopStyle: 'solid',
                      borderTopColor: currentTheme.colors.border,
                    }}
                  >
                    {/* Test Name Row */}
                    <div
                      className="p-3 font-medium"
                      style={{
                        backgroundColor: `${currentTheme.colors.surface}40`,
                        color: currentTheme.colors.text.primary,
                      }}
                    >
                      {testName}
                    </div>

                    {/* Viewport Results */}
                    {testResults.map((result, resultIndex) => {
                      const ticketLink = getTicketForResult(result.id);
                      return (
                        <div
                          key={result.id}
                          className="grid grid-cols-5 p-3 transition-colors hover:bg-opacity-50"
                          style={{
                            backgroundColor: resultIndex % 2 === 0 ? 'transparent' : `${currentTheme.colors.surface}20`,
                            borderTopWidth: '1px',
                            borderTopStyle: 'solid',
                            borderTopColor: currentTheme.colors.border,
                          }}
                        >
                          <div></div>
                          <div className="flex items-center justify-center gap-2">
                            {getViewportIcon(result.viewport)}
                            <span className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                              {result.viewport_size}
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            {getStatusIcon(result.status)}
                            <span
                              className="text-sm font-medium capitalize"
                              style={{ color: getStatusColor(result.status) }}
                            >
                              {result.status}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-mono" style={{ color: currentTheme.colors.text.secondary }}>
                              {formatDuration(result.duration_ms)}
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            {result.status === 'fail' && (
                              <>
                                <ThemedButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAnalyzeRootCause(result)}
                                  data-testid={`analyze-root-cause-btn-${result.id}`}
                                  title="AI Root Cause Analysis"
                                >
                                  <Brain className="w-3 h-3 mr-1" />
                                  Analyze
                                </ThemedButton>
                                {!ticketLink && (
                                  <ThemedButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleCreateTicket(result)}
                                    data-testid={`create-ticket-btn-${result.id}`}
                                  >
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Create Ticket
                                  </ThemedButton>
                                )}
                              </>
                            )}
                            {ticketLink && (
                              <a
                                href={ticketLink.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-colors hover:opacity-80"
                                style={{
                                  backgroundColor: `${currentTheme.colors.primary}20`,
                                  color: currentTheme.colors.primary,
                                  border: `1px solid ${currentTheme.colors.primary}`,
                                }}
                                data-testid={`ticket-link-${result.id}`}
                              >
                                <span className="capitalize">{ticketLink.trackerType}</span>
                                <span>#{ticketLink.ticketKey}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemedCardContent>

      {/* Create Ticket Modal */}
      {selectedResult && (
        <CreateTicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          testResult={selectedResult}
          testSuiteName={testSuiteName}
          targetUrl={targetUrl}
          onTicketCreated={handleTicketCreated}
        />
      )}

      {/* Root Cause Analysis Modal */}
      {selectedFailureResult && (
        <RootCauseAnalysisModal
          isOpen={isRootCauseModalOpen}
          onClose={() => setIsRootCauseModalOpen(false)}
          testResult={selectedFailureResult as unknown as TestResult}
        />
      )}
    </ThemedCard>
  );
}
