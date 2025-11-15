import { supabase } from '../supabase';
import { QueuedTestRun, QueueStats, ViewportConfig } from '../types';

/**
 * Queue Manager Service
 * Handles test run queue operations with retry logic and concurrency control
 */

/**
 * Add a test run to the queue
 */
export async function addToQueue(
  suiteId: string,
  config: ViewportConfig,
  priority: number = 0,
  maxRetries: number = 2
): Promise<string> {
  const { data, error } = await supabase
    .from('test_run_queue')
    .insert({
      suite_id: suiteId,
      config: config,
      priority: priority,
      status: 'queued',
      retry_count: 0,
      max_retries: maxRetries,
      scheduled_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to add to queue: ${error.message}`);
  }

  return data.id;
}

/**
 * Get next job from queue (highest priority, oldest first)
 */
export async function getNextQueuedJob(): Promise<QueuedTestRun | null> {
  const { data, error } = await supabase
    .from('test_run_queue')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get next job: ${error.message}`);
  }

  return data;
}

/**
 * Get count of currently running jobs
 */
export async function getRunningJobsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('test_run_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'running');

  if (error) {
    throw new Error(`Failed to get running jobs count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get concurrency limit from metadata
 */
export async function getConcurrencyLimit(): Promise<number> {
  const { data, error } = await supabase
    .from('queue_metadata')
    .select('value')
    .eq('key', 'concurrency_limit')
    .single();

  if (error) {
    console.warn('Failed to get concurrency limit, using default:', error);
    return 3; // Default
  }

  return typeof data.value === 'number' ? data.value : parseInt(data.value as string, 10) || 3;
}

/**
 * Update concurrency limit
 */
export async function setConcurrencyLimit(limit: number): Promise<void> {
  const { error } = await supabase
    .from('queue_metadata')
    .update({ value: limit })
    .eq('key', 'concurrency_limit');

  if (error) {
    throw new Error(`Failed to set concurrency limit: ${error.message}`);
  }
}

/**
 * Update queue job status
 */
export async function updateQueueJobStatus(
  jobId: string,
  status: QueuedTestRun['status'],
  runId?: string,
  errorMessage?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
  };

  if (status === 'running') {
    updates.started_at = new Date().toISOString();
  }

  if (status === 'completed' || status === 'failed' || status === 'cancelled') {
    updates.completed_at = new Date().toISOString();
  }

  if (runId) {
    updates.run_id = runId;
  }

  if (errorMessage) {
    updates.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('test_run_queue')
    .update(updates)
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to update queue job status: ${error.message}`);
  }
}

/**
 * Retry a failed job
 */
export async function retryQueueJob(jobId: string): Promise<void> {
  // Get current job
  const { data: job, error: fetchError } = await supabase
    .from('test_run_queue')
    .select('*')
    .eq('id', jobId)
    .single();

  if (fetchError || !job) {
    throw new Error('Job not found');
  }

  // Check if we can retry
  if (job.retry_count >= job.max_retries) {
    throw new Error('Maximum retry attempts reached');
  }

  // Update to retrying status
  const { error } = await supabase
    .from('test_run_queue')
    .update({
      status: 'queued',
      retry_count: job.retry_count + 1,
      error_message: null,
      started_at: null,
      completed_at: null,
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to retry job: ${error.message}`);
  }
}

/**
 * Auto-retry failed job if under max retries
 */
export async function autoRetryIfPossible(jobId: string): Promise<boolean> {
  const { data: job, error: fetchError } = await supabase
    .from('test_run_queue')
    .select('*')
    .eq('id', jobId)
    .single();

  if (fetchError || !job) {
    return false;
  }

  if (job.retry_count < job.max_retries) {
    await retryQueueJob(jobId);
    return true;
  }

  return false;
}

/**
 * Cancel a queued or running job
 */
export async function cancelQueueJob(jobId: string): Promise<void> {
  const { error } = await supabase
    .from('test_run_queue')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .in('status', ['queued', 'running']);

  if (error) {
    throw new Error(`Failed to cancel job: ${error.message}`);
  }
}

/**
 * Get all queue jobs with optional filtering
 */
export async function getQueueJobs(
  suiteId?: string,
  status?: QueuedTestRun['status'],
  limit: number = 50
): Promise<QueuedTestRun[]> {
  let query = supabase
    .from('test_run_queue')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (suiteId) {
    query = query.eq('suite_id', suiteId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get queue jobs: ${error.message}`);
  }

  return data || [];
}

/**
 * Get queue statistics
 */
export async function getQueueStats(suiteId?: string): Promise<QueueStats> {
  let query = supabase.from('test_run_queue').select('status');

  if (suiteId) {
    query = query.eq('suite_id', suiteId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get queue stats: ${error.message}`);
  }

  const jobs = data || [];

  return {
    queued: jobs.filter(j => j.status === 'queued').length,
    running: jobs.filter(j => j.status === 'running').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    retrying: jobs.filter(j => j.status === 'retrying').length,
    total: jobs.length,
  };
}

/**
 * Delete old completed/failed jobs (cleanup)
 */
export async function cleanupOldJobs(olderThanDays: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const { data, error } = await supabase
    .from('test_run_queue')
    .delete()
    .in('status', ['completed', 'failed', 'cancelled'])
    .lt('completed_at', cutoffDate.toISOString())
    .select('id');

  if (error) {
    throw new Error(`Failed to cleanup old jobs: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Subscribe to queue changes
 */
export function subscribeToQueue(
  callback: (payload: unknown) => void,
  suiteId?: string
) {
  const channel = supabase
    .channel('queue-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'test_run_queue',
        filter: suiteId ? `suite_id=eq.${suiteId}` : undefined,
      },
      callback
    )
    .subscribe();

  return channel;
}
