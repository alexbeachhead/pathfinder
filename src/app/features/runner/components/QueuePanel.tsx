'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { QueueBadge } from '@/components/ui/QueueBadge';
import { useRunQueue } from '@/hooks/useRunQueue';
import {
  ListChecks,
  X,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Play,
  Clock,
} from 'lucide-react';
import { formatDuration } from '../lib/testExecution';

interface QueuePanelProps {
  suiteId?: string;
  onViewRun?: (runId: string) => void;
}

export function QueuePanel({ suiteId, onViewRun }: QueuePanelProps) {
  const { currentTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempConcurrency, setTempConcurrency] = useState<number>(3);

  const { jobs, stats, concurrencyLimit, isLoading, error, cancelJob, retryJob, setConcurrency } =
    useRunQueue({ suiteId });

  const handleSetConcurrency = async () => {
    try {
      await setConcurrency(tempConcurrency);
      setShowSettings(false);
    } catch (err) {
      console.error('Failed to set concurrency:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return '#f59e0b';
      case 'running':
        return currentTheme.colors.primary;
      case 'completed':
        return '#22c55e';
      case 'failed':
        return '#ef4444';
      case 'retrying':
        return '#8b5cf6';
      case 'cancelled':
        return currentTheme.colors.text.tertiary;
      default:
        return currentTheme.colors.text.tertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="w-4 h-4" />;
      case 'running':
        return <Play className="w-4 h-4 animate-pulse" />;
      case 'retrying':
        return <RotateCcw className="w-4 h-4 animate-spin" />;
      default:
        return <ListChecks className="w-4 h-4" />;
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: currentTheme.colors.border,
      }}
      data-testid="queue-panel"
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: `${currentTheme.colors.primary}05`,
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: currentTheme.colors.border,
        }}
      >
        <div className="flex items-center gap-3">
          <ListChecks className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
          <div>
            <h3 className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
              Test Queue
            </h3>
            <p className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
              Manage batch execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <QueueBadge stats={stats} concurrencyLimit={concurrencyLimit} />

          <ThemedButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            data-testid="queue-settings-btn"
          >
            <Settings className="w-4 h-4" />
          </ThemedButton>

          {isExpanded ? (
            <ChevronUp className="w-5 h-5" style={{ color: currentTheme.colors.text.secondary }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: currentTheme.colors.text.secondary }} />
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-3 overflow-hidden"
            style={{
              backgroundColor: `${currentTheme.colors.surface}`,
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: currentTheme.colors.border,
            }}
          >
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: currentTheme.colors.text.primary }}>
                  Concurrency Limit
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tempConcurrency}
                    onChange={(e) => setTempConcurrency(parseInt(e.target.value, 10))}
                    className="px-3 py-2 rounded-lg flex-1"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text.primary,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: currentTheme.colors.border,
                    }}
                    data-testid="concurrency-input"
                  />
                  <ThemedButton variant="primary" size="sm" onClick={handleSetConcurrency} data-testid="save-concurrency-btn">
                    Save
                  </ThemedButton>
                </div>
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.tertiary }}>
                  Max {concurrencyLimit} tests can run simultaneously
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <p style={{ color: currentTheme.colors.text.tertiary }}>Loading queue...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p style={{ color: '#ef4444' }}>{error}</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-8 text-center">
                  <ListChecks className="w-12 h-12 mx-auto mb-2 opacity-20" style={{ color: currentTheme.colors.text.tertiary }} />
                  <p style={{ color: currentTheme.colors.text.tertiary }}>No jobs in queue</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: currentTheme.colors.border }}>
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="px-4 py-3 hover:bg-opacity-50 transition-colors"
                      style={{
                        backgroundColor: job.status === 'running' ? `${currentTheme.colors.primary}05` : 'transparent',
                      }}
                      data-testid={`queue-job-${job.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ color: getStatusColor(job.status) }}>
                              {getStatusIcon(job.status)}
                            </span>
                            <span
                              className="text-sm font-medium capitalize"
                              style={{ color: currentTheme.colors.text.primary }}
                            >
                              {job.status}
                            </span>
                            {job.priority > 0 && (
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${currentTheme.colors.primary}20`,
                                  color: currentTheme.colors.primary,
                                }}
                              >
                                Priority {job.priority}
                              </span>
                            )}
                            {job.retry_count > 0 && (
                              <span className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                                Retry {job.retry_count}/{job.max_retries}
                              </span>
                            )}
                          </div>

                          <div className="text-xs space-y-0.5">
                            <p style={{ color: currentTheme.colors.text.secondary }}>
                              Created: {new Date(job.created_at).toLocaleString()}
                            </p>
                            {job.started_at && (
                              <p style={{ color: currentTheme.colors.text.tertiary }}>
                                Started: {formatDuration(new Date().getTime() - new Date(job.started_at).getTime())} ago
                              </p>
                            )}
                            {job.error_message && (
                              <p className="text-xs" style={{ color: '#ef4444' }}>
                                Error: {job.error_message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {job.status === 'failed' && job.retry_count < job.max_retries && (
                            <ThemedButton
                              variant="ghost"
                              size="sm"
                              onClick={() => retryJob(job.id)}
                              leftIcon={<RotateCcw className="w-3 h-3" />}
                              data-testid={`retry-job-btn-${job.id}`}
                            >
                              Retry
                            </ThemedButton>
                          )}

                          {(job.status === 'queued' || job.status === 'running') && (
                            <ThemedButton
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelJob(job.id)}
                              leftIcon={<X className="w-3 h-3" />}
                              data-testid={`cancel-job-btn-${job.id}`}
                            >
                              Cancel
                            </ThemedButton>
                          )}

                          {job.run_id && onViewRun && (
                            <ThemedButton
                              variant="secondary"
                              size="sm"
                              onClick={() => onViewRun(job.run_id!)}
                              data-testid={`view-run-btn-${job.id}`}
                            >
                              View
                            </ThemedButton>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
