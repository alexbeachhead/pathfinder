import { NextRequest, NextResponse } from 'next/server';
import { detectAnomalies, fetchHistoricalTestRuns, TestRunLogData } from '@/lib/anomaly-detection/service';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60;

/**
 * POST /api/anomaly-detection/detect
 * Detect anomalies in a test run
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, suiteId, lookbackDays = 30 } = body;

    if (!runId) {
      return NextResponse.json(
        { error: 'runId is required' },
        { status: 400 }
      );
    }

    // Fetch current run data
    const { data: currentRun, error: runError } = await supabase
      .from('test_runs')
      .select('id, status, created_at, duration_ms, suite_id')
      .eq('id', runId)
      .single();

    if (runError || !currentRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      );
    }

    // Get test results for current run
    const { data: results, error: resultsError } = await supabase
      .from('test_results')
      .select('id, status, errors, console_logs, test_name')
      .eq('run_id', runId);

    if (resultsError) {
      return NextResponse.json(
        { error: 'Failed to fetch test results' },
        { status: 500 }
      );
    }

    const totalTests = results?.length || 0;
    const passedTests = results?.filter(r => r.status === 'pass').length || 0;
    const failedTests = results?.filter(r => r.status === 'fail').length || 0;

    const allErrors = results?.flatMap(r => r.errors || []) || [];
    const allLogs = results?.flatMap(r => r.console_logs || []) || [];
    const testNames = results?.map(r => r.test_name).filter(Boolean) as string[] || [];

    const currentRunData: TestRunLogData = {
      runId: currentRun.id,
      status: currentRun.status,
      createdAt: currentRun.created_at,
      durationMs: currentRun.duration_ms,
      totalTests,
      passedTests,
      failedTests,
      errors: allErrors,
      consoleLogs: allLogs,
      testNames,
    };

    // Fetch historical runs for baseline
    const historicalRuns = await fetchHistoricalTestRuns(
      suiteId || currentRun.suite_id,
      lookbackDays,
      20
    );

    // Filter out the current run from historical data
    const baselineRuns = historicalRuns.filter(r => r.runId !== runId);

    // Detect anomalies
    const anomalyResult = await detectAnomalies(currentRunData, baselineRuns);

    return NextResponse.json({
      success: true,
      data: anomalyResult,
    });
  } catch (error) {
    console.error('Error in anomaly detection:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}
