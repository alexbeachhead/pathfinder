# Test Run Queue - Quick Start Guide

## What is it?

A lightweight queue system that manages multiple test run requests, automatically retries failed runs, and limits concurrent executions. Perfect for batch testing and CI/CD workflows.

## 5-Minute Setup

### 1. Database Setup (30 seconds)

Run this SQL in your Supabase SQL Editor:

```bash
# Execute the migration file
supabase/schema-run-queue.sql
```

This creates:
- `test_run_queue` table (stores queued jobs)
- `queue_metadata` table (stores settings like concurrency limit)

### 2. Using the Queue in UI (2 minutes)

**In the Runner page:**

1. Select a test suite
2. Configure viewports
3. Click **"Add to Queue"** instead of "Start Now"
4. Watch the **Queue Badge** in the header update
5. Expand the **Queue Panel** to see job status

**Queue Panel Features:**
- View all queued, running, and completed jobs
- Cancel running jobs
- Retry failed jobs
- Adjust concurrency limit (how many tests run at once)

### 3. Programmatic Usage (2 minutes)

**Add a job to the queue:**

```typescript
import { useRunQueue } from '@/hooks/useRunQueue';

function MyComponent() {
  const { addJob, stats } = useRunQueue();

  const handleAddToQueue = async () => {
    await addJob(
      'suite-id-123',
      {
        mobile: { width: 375, height: 667 },
        desktop: { width: 1920, height: 1080 }
      },
      0 // priority (higher = runs first)
    );
  };

  return (
    <div>
      <button onClick={handleAddToQueue}>Add to Queue</button>
      <p>Queued: {stats.queued}, Running: {stats.running}</p>
    </div>
  );
}
```

**Monitor the queue:**

```typescript
const { jobs, stats, isLoading } = useRunQueue({
  suiteId: 'optional-suite-id',
  autoRefresh: true
});

// jobs: array of queued/running/completed jobs
// stats: { queued, running, completed, failed, total }
```

## Key Concepts

### Job Lifecycle

```
Queued → Running → Completed/Failed
              ↓
           (auto-retry if failed & retries left)
```

### Concurrency Control

Default: 3 tests run simultaneously

Change it:
- UI: Queue Panel → Settings gear icon
- Code: `setConcurrency(5)`

### Auto-Retry

Failed tests automatically retry up to 2 times (configurable)

## Common Tasks

### Add multiple jobs at once

```typescript
const suites = ['suite-1', 'suite-2', 'suite-3'];
for (const suiteId of suites) {
  await addJob(suiteId, config);
}
```

### Prioritize critical tests

```typescript
await addJob(criticalSuiteId, config, 10); // High priority
await addJob(normalSuiteId, config, 0);   // Normal priority
```

### Cancel all queued jobs

```typescript
const { jobs, cancelJob } = useRunQueue();
const queued = jobs.filter(j => j.status === 'queued');
await Promise.all(queued.map(j => cancelJob(j.id)));
```

### Check queue before adding

```typescript
const { stats } = useRunQueue();
if (stats.queued < 10) {
  await addJob(suiteId, config);
} else {
  alert('Queue is full!');
}
```

## Troubleshooting

**Jobs not processing?**
- The queue processor needs to be running (it's automatic in the UI)
- Check concurrency limit isn't 0

**Jobs failing repeatedly?**
- Check the error message in Queue Panel
- Verify test suite configuration
- Increase max retries if needed

**Need to clear old jobs?**
```typescript
import { cleanupOldJobs } from '@/lib/queue/queueManager';
await cleanupOldJobs(7); // Delete jobs older than 7 days
```

## Next Steps

- Read full documentation: `QUEUE_SYSTEM_GUIDE.md`
- Customize retry logic in queue processor
- Set up scheduled queue processing
- Monitor queue analytics in dashboard

## Architecture at a Glance

```
User clicks "Add to Queue"
    ↓
Job added to database (Supabase)
    ↓
Queue processor picks it up (respects concurrency)
    ↓
Test executes via /api/playwright/execute
    ↓
Results saved, job marked complete/failed
    ↓
Auto-retry if failed (up to max retries)
```

That's it! You now have a production-ready test queue system.
