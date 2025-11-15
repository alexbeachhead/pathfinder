import { useState, useEffect, useCallback } from 'react';
import { QueuedTestRun, QueueStats, ViewportConfig } from '@/lib/types';
import {
  addToQueue,
  getQueueJobs,
  getQueueStats,
  updateQueueJobStatus,
  cancelQueueJob,
  retryQueueJob,
  subscribeToQueue,
  getConcurrencyLimit,
  setConcurrencyLimit,
} from '@/lib/queue/queueManager';

interface UseRunQueueOptions {
  suiteId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseRunQueueReturn {
  jobs: QueuedTestRun[];
  stats: QueueStats;
  concurrencyLimit: number;
  isLoading: boolean;
  error: string | null;
  addJob: (suiteId: string, config: ViewportConfig, priority?: number) => Promise<string>;
  cancelJob: (jobId: string) => Promise<void>;
  retryJob: (jobId: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: QueuedTestRun['status'], runId?: string, errorMessage?: string) => Promise<void>;
  refreshQueue: () => Promise<void>;
  setConcurrency: (limit: number) => Promise<void>;
}

/**
 * Helper function to handle errors consistently
 */
function handleError(err: unknown, fallbackMessage: string): string {
  return err instanceof Error ? err.message : fallbackMessage;
}

/**
 * Hook for managing test run queue
 * Provides queue state, statistics, and operations
 */
export function useRunQueue(options: UseRunQueueOptions = {}): UseRunQueueReturn {
  const { suiteId, autoRefresh = true, refreshInterval = 5000 } = options;

  const [jobs, setJobs] = useState<QueuedTestRun[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
    total: 0,
  });
  const [concurrencyLimit, setConcurrencyLimitState] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch queue data
  const fetchQueueData = useCallback(async () => {
    try {
      setError(null);
      const [jobsData, statsData, limitData] = await Promise.all([
        getQueueJobs(suiteId),
        getQueueStats(suiteId),
        getConcurrencyLimit(),
      ]);

      setJobs(jobsData);
      setStats(statsData);
      setConcurrencyLimitState(limitData);
    } catch (err) {
      setError(handleError(err, 'Failed to load queue data'));
    } finally {
      setIsLoading(false);
    }
  }, [suiteId]);

  // Initial load
  useEffect(() => {
    fetchQueueData();
  }, [fetchQueueData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchQueueData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchQueueData]);

  // Real-time subscription
  useEffect(() => {
    const channel = subscribeToQueue(
      (payload) => {
        // Refresh queue when changes occur
        fetchQueueData();
      },
      suiteId
    );

    return () => {
      channel.unsubscribe();
    };
  }, [suiteId, fetchQueueData]);

  // Add job to queue
  const addJob = useCallback(
    async (suiteId: string, config: ViewportConfig, priority: number = 0): Promise<string> => {
      try {
        setError(null);
        const jobId = await addToQueue(suiteId, config, priority);
        await fetchQueueData(); // Refresh after adding
        return jobId;
      } catch (err) {
        setError(handleError(err, 'Failed to add job'));
        throw err;
      }
    },
    [fetchQueueData]
  );

  // Cancel job
  const cancelJob = useCallback(
    async (jobId: string): Promise<void> => {
      try {
        setError(null);
        await cancelQueueJob(jobId);
        await fetchQueueData(); // Refresh after canceling
      } catch (err) {
        setError(handleError(err, 'Failed to cancel job'));
        throw err;
      }
    },
    [fetchQueueData]
  );

  // Retry job
  const retryJob = useCallback(
    async (jobId: string): Promise<void> => {
      try {
        setError(null);
        await retryQueueJob(jobId);
        await fetchQueueData(); // Refresh after retrying
      } catch (err) {
        setError(handleError(err, 'Failed to retry job'));
        throw err;
      }
    },
    [fetchQueueData]
  );

  // Update job status
  const updateJobStatus = useCallback(
    async (
      jobId: string,
      status: QueuedTestRun['status'],
      runId?: string,
      errorMessage?: string
    ): Promise<void> => {
      try {
        setError(null);
        await updateQueueJobStatus(jobId, status, runId, errorMessage);
        await fetchQueueData(); // Refresh after updating
      } catch (err) {
        setError(handleError(err, 'Failed to update job status'));
        throw err;
      }
    },
    [fetchQueueData]
  );

  // Set concurrency limit
  const setConcurrency = useCallback(
    async (limit: number): Promise<void> => {
      try {
        setError(null);
        await setConcurrencyLimit(limit);
        setConcurrencyLimitState(limit);
      } catch (err) {
        setError(handleError(err, 'Failed to set concurrency limit'));
        throw err;
      }
    },
    []
  );

  return {
    jobs,
    stats,
    concurrencyLimit,
    isLoading,
    error,
    addJob,
    cancelJob,
    retryJob,
    updateJobStatus,
    refreshQueue: fetchQueueData,
    setConcurrency,
  };
}
