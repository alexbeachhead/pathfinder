import {
  getNextQueuedJob,
  getRunningJobsCount,
  getConcurrencyLimit,
  updateQueueJobStatus,
  autoRetryIfPossible,
} from './queueManager';
import { createTestRun, updateTestRunStatus } from '../supabase/testRuns';

/**
 * Queue Processor
 * Processes queued test runs with concurrency control and retry logic
 */

interface QueueProcessorOptions {
  onJobStart?: (jobId: string, runId: string) => void;
  onJobComplete?: (jobId: string, runId: string, success: boolean) => void;
  onJobError?: (jobId: string, error: Error) => void;
}

/**
 * Process the queue - should be called periodically or triggered by queue changes
 */
export async function processQueue(options: QueueProcessorOptions = {}): Promise<void> {
  try {
    // Check concurrency limit
    const [runningCount, limit] = await Promise.all([
      getRunningJobsCount(),
      getConcurrencyLimit(),
    ]);

    if (runningCount >= limit) {
      // At capacity, don't start new jobs
      return;
    }

    // Get next job
    const job = await getNextQueuedJob();
    if (!job) {
      // No jobs to process
      return;
    }

    // Start the job
    await startQueueJob(job.id, job.suite_id, job.config, options);
  } catch (error) {
    console.error('Queue processor error:', error);
  }
}

/**
 * Start a queued job
 */
async function startQueueJob(
  jobId: string,
  suiteId: string,
  config: Record<string, unknown>,
  options: QueueProcessorOptions
): Promise<void> {
  try {
    // Mark job as running
    await updateQueueJobStatus(jobId, 'running');

    // Create test run in database
    const runId = await createTestRun(suiteId, { viewports: [config] });

    // Notify job started
    if (options.onJobStart) {
      options.onJobStart(jobId, runId);
    }

    // Execute the test via API
    const response = await fetch('/api/playwright/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suiteId,
        viewports: [config],
        screenshotOnEveryStep: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Test execution failed');
    }

    const result = await response.json() as { results?: Array<{ status: string }> };

    // Check if any tests failed
    const failed = result.results?.filter((r) => r.status === 'fail').length || 0;
    const success = failed === 0;

    // Update test run status
    await updateTestRunStatus(runId, success ? 'completed' : 'failed');

    // Mark job as completed or failed
    if (success) {
      await updateQueueJobStatus(jobId, 'completed', runId);
      if (options.onJobComplete) {
        options.onJobComplete(jobId, runId, true);
      }
    } else {
      // Try to auto-retry if possible
      const retried = await autoRetryIfPossible(jobId);
      if (!retried) {
        // Can't retry, mark as failed
        await updateQueueJobStatus(jobId, 'failed', runId, `${failed} tests failed`);
        if (options.onJobComplete) {
          options.onJobComplete(jobId, runId, false);
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Job execution error:', error);

    // Try to auto-retry if possible
    const retried = await autoRetryIfPossible(jobId);
    if (!retried) {
      // Can't retry, mark as failed
      await updateQueueJobStatus(jobId, 'failed', undefined, errorMessage);
      if (options.onJobError && error instanceof Error) {
        options.onJobError(jobId, error);
      }
    }
  }
}

/**
 * Start queue processor loop (call this to start processing)
 */
export function startQueueProcessor(
  intervalMs: number = 5000,
  options: QueueProcessorOptions = {}
): () => void {
  const interval = setInterval(() => {
    processQueue(options);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}
