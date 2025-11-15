/**
 * Test Run Queue System
 *
 * Exports all queue management utilities, hooks, and processors
 */

// Queue Manager
export {
  addToQueue,
  getNextQueuedJob,
  getRunningJobsCount,
  getConcurrencyLimit,
  setConcurrencyLimit,
  updateQueueJobStatus,
  retryQueueJob,
  autoRetryIfPossible,
  cancelQueueJob,
  getQueueJobs,
  getQueueStats,
  cleanupOldJobs,
  subscribeToQueue,
} from './queueManager';

// Queue Processor
export {
  processQueue,
  startQueueProcessor,
} from './queueProcessor';

// Re-export types
export type {
  QueuedTestRun,
  QueueStats,
  QueueMetadata,
} from '../types';
