import { TestSuite, ConsoleLog } from '@/lib/types';

export const DEMO_SUITE_STORAGE_KEY = 'pathfinder_runner_first_visit';
export const DEMO_RUN_ID = 'demo-run-001';

/**
 * Check if this is the user's first visit to the Runner
 */
export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return false;

  const hasVisited = localStorage.getItem(DEMO_SUITE_STORAGE_KEY);
  return !hasVisited;
}

/**
 * Mark that the user has visited the Runner
 */
export function markAsVisited(): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(DEMO_SUITE_STORAGE_KEY, new Date().toISOString());
}

/**
 * Generate a demo test suite for first-time users
 */
export function generateDemoTestSuite(): TestSuite {
  return {
    id: 'demo-suite-001',
    name: 'Welcome Demo',
    target_url: 'https://playwright.dev',
    description: 'A quick demo test to show you how the Runner works',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Helper to create a console log with timestamp
 */
function createLog(type: ConsoleLog['type'], message: string): ConsoleLog {
  return {
    type,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate streaming demo logs that simulate a real test run
 */
export function* generateDemoLogs(): Generator<ConsoleLog[], void, unknown> {
  const logSequences: ConsoleLog[][] = [
    [
      createLog('info', 'Starting demo test execution for suite: Welcome Demo'),
      createLog('info', 'Target URL: https://playwright.dev'),
      createLog('info', 'Viewports: iPhone 12, iPad, Tablet'),
    ],
    [
      createLog('info', 'Initializing Playwright browser...'),
    ],
    [
      createLog('info', '[Viewport 1] iPhone 12: Starting test'),
      createLog('log', '  [iPhone 12] Navigating to https://playwright.dev'),
    ],
    [
      createLog('log', '  [iPhone 12] Page loaded successfully'),
      createLog('log', '  [iPhone 12] Capturing screenshot...'),
    ],
    [
      createLog('info', '[Viewport 1] iPhone 12: PASS (1247ms)'),
    ],
    [
      createLog('info', '[Viewport 2] iPad: Starting test'),
      createLog('log', '  [iPad] Navigating to https://playwright.dev'),
    ],
    [
      createLog('log', '  [iPad] Page loaded successfully'),
      createLog('log', '  [iPad] Capturing screenshot...'),
    ],
    [
      createLog('info', '[Viewport 2] iPad: PASS (1156ms)'),
    ],
    [
      createLog('info', '[Viewport 3] Tablet: Starting test'),
      createLog('log', '  [Tablet] Navigating to https://playwright.dev'),
    ],
    [
      createLog('log', '  [Tablet] Page loaded successfully'),
      createLog('log', '  [Tablet] Capturing screenshot...'),
    ],
    [
      createLog('info', '[Viewport 3] Tablet: PASS (1089ms)'),
    ],
    [
      createLog('info', 'Test execution completed. 3 passed, 0 failed.'),
    ],
  ];

  for (const logs of logSequences) {
    yield logs;
  }
}

/**
 * Simulate demo test execution with progress updates
 */
export async function runDemoExecution(
  onProgressUpdate: (progress: {
    current: number;
    total: number;
    percentage: number;
    passed: number;
    failed: number;
    skipped: number;
    elapsedTime: number;
  }) => void,
  onLogsUpdate: (logs: ConsoleLog[]) => void
): Promise<void> {
  const startTime = Date.now();
  const totalViewports = 3;
  const logGenerator = generateDemoLogs();
  let currentViewport = 0;
  let passedCount = 0;
  let allLogs: ConsoleLog[] = [];

  // Simulate progressive execution
  for (const logBatch of logGenerator) {
    // Add logs
    allLogs = [...allLogs, ...logBatch];
    onLogsUpdate([...allLogs]);

    // Update progress based on viewport completion
    const lastLog = logBatch[logBatch.length - 1];
    if (lastLog.message.includes('PASS')) {
      currentViewport++;
      passedCount++;
    }

    onProgressUpdate({
      current: currentViewport,
      total: totalViewports,
      percentage: Math.round((currentViewport / totalViewports) * 100),
      passed: passedCount,
      failed: 0,
      skipped: 0,
      elapsedTime: Date.now() - startTime,
    });

    // Simulate delay between log batches (300-600ms for realistic streaming)
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));
  }

  // Final update
  onProgressUpdate({
    current: totalViewports,
    total: totalViewports,
    percentage: 100,
    passed: passedCount,
    failed: 0,
    skipped: 0,
    elapsedTime: Date.now() - startTime,
  });
}
