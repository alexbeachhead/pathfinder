'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { TestSuiteSelector } from './components/TestSuiteSelector';
import { ViewportConfigurator } from './components/ViewportConfigurator';
import { ExecutionProgress } from './components/ExecutionProgress';
import { LiveLogsPanel } from './components/LiveLogsPanel';
import { RunHistoryPanel } from './components/RunHistoryPanel';
import { DemoBanner } from './components/DemoBanner';
import { QueuePanel } from './components/QueuePanel';
import { TestSuite, ConsoleLog } from '@/lib/types';
import { useRunQueue } from '@/hooks/useRunQueue';
import { QueueBadge } from '@/components/ui/QueueBadge';
import { VIEWPORTS } from '@/lib/config';
import { Play, StopCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigation } from '@/lib/stores/appStore';
import {
  isFirstVisit,
  markAsVisited,
  generateDemoTestSuite,
  runDemoExecution,
  DEMO_RUN_ID,
} from './lib/demoRunner';

interface ViewportConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  enabled: boolean;
}

type ExecutionState = 'idle' | 'running' | 'completed' | 'failed';

export function RealRunner() {
  const { currentTheme } = useTheme();
  const { navigateTo, setReportId } = useNavigation();
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [viewports, setViewports] = useState<ViewportConfig[]>([
    { id: 'mobile_small', name: VIEWPORTS.mobile_small.name, width: VIEWPORTS.mobile_small.width, height: VIEWPORTS.mobile_small.height, enabled: true },
    { id: 'mobile_large', name: VIEWPORTS.mobile_large.name, width: VIEWPORTS.mobile_large.width, height: VIEWPORTS.mobile_large.height, enabled: true },
    { id: 'tablet', name: VIEWPORTS.tablet.name, width: VIEWPORTS.tablet.width, height: VIEWPORTS.tablet.height, enabled: true },
    { id: 'desktop', name: VIEWPORTS.desktop.name, width: VIEWPORTS.desktop.width, height: VIEWPORTS.desktop.height, enabled: false },
    { id: 'desktop_large', name: VIEWPORTS.desktop_large.name, width: VIEWPORTS.desktop_large.width, height: VIEWPORTS.desktop_large.height, enabled: false },
  ]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    elapsedTime: 0,
  });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  // Queue management
  const { stats: queueStats, addJob } = useRunQueue({ suiteId: selectedSuite?.id });

  // Auto-start demo on first visit
  useEffect(() => {
    if (isFirstVisit()) {
      // Generate and set demo test suite
      const demoSuite = generateDemoTestSuite();
      setSelectedSuite(demoSuite);
      setIsDemoMode(true);
      setShowDemoBanner(true);

      // Auto-start demo execution after a brief delay
      const timer = setTimeout(() => {
        startDemoExecution();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const startDemoExecution = async () => {
    setExecutionState('running');
    setTestRunId(DEMO_RUN_ID);

    try {
      await runDemoExecution(
        (progressUpdate) => {
          setProgress(progressUpdate);
        },
        (logs) => {
          setConsoleLogs(logs);
        }
      );

      setExecutionState('completed');
    } catch (error) {
      // Demo execution error - silently handle
      setExecutionState('failed');
    }
  };

  const handleDismissBanner = () => {
    setShowDemoBanner(false);
    markAsVisited();
  };

  const handleCreateRealSuite = () => {
    setShowDemoBanner(false);
    markAsVisited();
    navigateTo('designer');
  };

  const startExecution = async () => {
    if (!selectedSuite) return;

    const enabledViewports = viewports.filter(v => v.enabled);
    if (enabledViewports.length === 0) {
      alert('Please select at least one viewport');
      return;
    }

    setExecutionState('running');
    setConsoleLogs([
      {
        type: 'info',
        message: `Starting test execution for suite: ${selectedSuite.name}`,
        timestamp: new Date().toISOString(),
      },
      {
        type: 'info',
        message: `Target URL: ${selectedSuite.target_url}`,
        timestamp: new Date().toISOString(),
      },
      {
        type: 'info',
        message: `Viewports: ${enabledViewports.map(v => v.name).join(', ')}`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setProgress({
      current: 0,
      total: enabledViewports.length,
      percentage: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      elapsedTime: 0,
    });

    try {
      const startTime = Date.now();

      // Convert viewport configs to API format
      const viewportConfigs = enabledViewports.map(v => ({
        mobile: v.name.includes('iPhone') || v.name.includes('Mobile') ? { width: v.width, height: v.height } : undefined,
        tablet: v.name.includes('iPad') || v.name.includes('Tablet') ? { width: v.width, height: v.height } : undefined,
        desktop: v.name.includes('Desktop') ? { width: v.width, height: v.height } : undefined,
      }));

      // Call execution API
      const response = await fetch('/api/playwright/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suiteId: selectedSuite.id,
          viewports: viewportConfigs,
          screenshotOnEveryStep: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Test execution failed');
      }

      const result = await response.json();
      setTestRunId(result.testRunId);

      // Update progress based on results
      interface TestResult {
        status: string;
        viewport: string;
        durationMs: number;
        consoleLogs?: Array<{ type: string; message: string; timestamp?: string }>;
        errors?: Array<{ message: string; stack?: string }>;
      }
      const passed = result.results.filter((r: TestResult) => r.status === 'pass').length;
      const failed = result.results.filter((r: TestResult) => r.status === 'fail').length;

      // Log each result with detailed information
      result.results.forEach((r: TestResult, index: number) => {
        // Add viewport result summary
        setConsoleLogs(prev => [
          ...prev,
          {
            type: r.status === 'fail' ? 'error' : 'info',
            message: `[Viewport ${index + 1}] ${r.viewport}: ${r.status.toUpperCase()} (${r.durationMs}ms)`,
            timestamp: new Date().toISOString(),
          },
        ]);

        // Add console logs from Playwright
        if (r.consoleLogs && r.consoleLogs.length > 0) {
          r.consoleLogs.forEach((log) => {
            const logType = log.type as 'info' | 'log' | 'warn' | 'error' | undefined;
            setConsoleLogs(prev => [
              ...prev,
              {
                type: logType || 'log',
                message: `  [${r.viewport}] ${log.message}`,
                timestamp: log.timestamp || new Date().toISOString(),
              },
            ]);
          });
        }

        // Add errors from Playwright
        if (r.errors && r.errors.length > 0) {
          r.errors.forEach((error) => {
            setConsoleLogs(prev => [
              ...prev,
              {
                type: 'error',
                message: `  [${r.viewport}] ERROR: ${error.message}`,
                timestamp: new Date().toISOString(),
              },
            ]);
            if (error.stack) {
              setConsoleLogs(prev => [
                ...prev,
                {
                  type: 'error',
                  message: `  ${error.stack?.split('\n').slice(0, 3).join('\n  ') || error.message}`,
                  timestamp: new Date().toISOString(),
                },
              ]);
            }
          });
        }
      });

      setProgress({
        current: result.results.length,
        total: result.results.length,
        percentage: 100,
        passed,
        failed,
        skipped: 0,
        elapsedTime: Date.now() - startTime,
      });

      setExecutionState(failed > 0 ? 'failed' : 'completed');

      // Add completion log
      setConsoleLogs(prev => [
        ...prev,
        {
          type: failed > 0 ? 'error' : 'info',
          message: `Test execution completed. ${passed} passed, ${failed} failed.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error: unknown) {
      // Execution error - silently handle
      const errorMessage = error instanceof Error ? error.message : 'Test execution failed';
      setExecutionState('failed');
      setConsoleLogs(prev => [
        ...prev,
        {
          type: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const resetExecution = () => {
    setExecutionState('idle');
    setTestRunId(null);
    setConsoleLogs([]);
    setProgress({
      current: 0,
      total: 0,
      percentage: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      elapsedTime: 0,
    });
  };

  const handleRelaunch = (runId: string) => {
    // Reset execution state and start again
    resetExecution();
    // Could load the run config and use it, but for now just reset
    // to allow user to configure and start fresh
  };

  const handleViewDetails = (runId: string) => {
    // Navigate to reports page with this run ID
    setReportId(runId);
    navigateTo('reports');
  };

  const canStart = selectedSuite && viewports.some(v => v.enabled) && executionState === 'idle';

  // Add to queue instead of immediate execution
  const addToQueue = async () => {
    if (!selectedSuite) return;

    const enabledViewports = viewports.filter(v => v.enabled);
    if (enabledViewports.length === 0) {
      alert('Please select at least one viewport');
      return;
    }

    try {
      // Convert viewport configs to API format
      const config = {
        mobile: enabledViewports.find(v => v.name.includes('iPhone') || v.name.includes('Mobile'))
          ? { width: enabledViewports[0].width, height: enabledViewports[0].height }
          : undefined,
        tablet: enabledViewports.find(v => v.name.includes('iPad') || v.name.includes('Tablet'))
          ? { width: enabledViewports[1].width, height: enabledViewports[1].height }
          : undefined,
        desktop: enabledViewports.find(v => v.name.includes('Desktop'))
          ? { width: enabledViewports[2]?.width || 1920, height: enabledViewports[2]?.height || 1080 }
          : undefined,
      };

      await addJob(selectedSuite.id, config, 0);

      setConsoleLogs(prev => [
        ...prev,
        {
          type: 'info',
          message: `Added test to queue: ${selectedSuite.name}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error: unknown) {
      // Failed to add to queue - silently handle
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to queue';
      setConsoleLogs(prev => [
        ...prev,
        {
          type: 'error',
          message: `Failed to add to queue: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div className="p-8 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
              Test Runner
            </h1>
            <p className="text-lg" style={{ color: currentTheme.colors.text.tertiary }}>
              Execute Playwright tests across multiple viewports
            </p>
          </div>
          <QueueBadge stats={queueStats} />
        </div>
      </motion.div>

      {/* Demo Banner */}
      {showDemoBanner && isDemoMode && (
        <DemoBanner onDismiss={handleDismissBanner} onCreateRealSuite={handleCreateRealSuite} />
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Viewport Configuration */}
        <div className="col-span-2">
          <ViewportConfigurator selectedViewports={viewports} onViewportsChange={setViewports} />
        </div>

        {/* Center - Execution Monitor */}
        <div className="col-span-6 space-y-6">
          {executionState === 'idle' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                  style={{
                    backgroundColor: `${currentTheme.colors.primary}10`,
                    borderWidth: '2px',
                    borderStyle: 'dashed',
                    borderColor: currentTheme.colors.primary,
                  }}
                >
                  <Play className="w-10 h-10" style={{ color: currentTheme.colors.primary }} />
                </div>
                <p className="text-lg font-medium" style={{ color: currentTheme.colors.text.primary }}>
                  Ready to Run Tests
                </p>
                <p style={{ color: currentTheme.colors.text.tertiary }}>
                  {!selectedSuite
                    ? 'Select a test suite to begin'
                    : !viewports.some(v => v.enabled)
                      ? 'Select at least one viewport'
                      : 'Click Start to begin execution'}
                </p>
                <div className="flex gap-3">
                  <ThemedButton
                    variant="primary"
                    size="lg"
                    onClick={startExecution}
                    disabled={!canStart}
                    leftIcon={<Play className="w-5 h-5" />}
                    data-testid="start-execution-btn"
                  >
                    Start Now
                  </ThemedButton>
                  <ThemedButton
                    variant="secondary"
                    size="lg"
                    onClick={addToQueue}
                    disabled={!selectedSuite || !viewports.some(v => v.enabled)}
                    data-testid="add-to-queue-btn"
                  >
                    Add to Queue
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

          {(executionState === 'running' || executionState === 'completed' || executionState === 'failed') && (
            <>
              <ExecutionProgress progress={progress} />

              {executionState === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-8 rounded-lg"
                  style={{
                    backgroundColor: '#22c55e10',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: '#22c55e30',
                  }}
                >
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: '#22c55e' }} />
                  <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    Tests Completed Successfully!
                  </h3>
                  <p style={{ color: currentTheme.colors.text.secondary }}>
                    {progress.passed} test{progress.passed !== 1 ? 's' : ''} passed
                  </p>
                  <ThemedButton
                    variant="secondary"
                    size="md"
                    onClick={resetExecution}
                    className="mt-4"
                    data-testid="run-again-btn"
                  >
                    Run Again
                  </ThemedButton>
                </motion.div>
              )}

              {executionState === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-8 rounded-lg"
                  style={{
                    backgroundColor: '#ef444410',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: '#ef444430',
                  }}
                >
                  <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
                  <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    Some Tests Failed
                  </h3>
                  <p style={{ color: currentTheme.colors.text.secondary }}>
                    {progress.failed} test{progress.failed !== 1 ? 's' : ''} failed, {progress.passed} passed
                  </p>
                  <ThemedButton
                    variant="secondary"
                    size="md"
                    onClick={resetExecution}
                    className="mt-4"
                    data-testid="run-again-failed-btn"
                  >
                    Run Again
                  </ThemedButton>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Test Suite Selector, Queue Panel & Run History */}
        <div className="col-span-4 space-y-6">
          <TestSuiteSelector selectedSuite={selectedSuite} onSelectSuite={setSelectedSuite} />
          <QueuePanel suiteId={selectedSuite?.id} onViewRun={handleViewDetails} />
          <RunHistoryPanel
            suiteId={selectedSuite?.id}
            onRelaunch={handleRelaunch}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>

      {/* Bottom Panel - Live Logs */}
      <LiveLogsPanel logs={consoleLogs} />
    </div>
  );
}
