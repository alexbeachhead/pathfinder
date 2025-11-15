import { NextRequest, NextResponse } from 'next/server';
import { detectAnomalies, fetchHistoricalTestRuns, TestRunLogData } from '@/lib/anomaly-detection/service';
import { supabase } from '@/lib/supabase';

export const maxDuration = 300;

/**
 * POST /api/anomaly-detection/batch
 * Detect anomalies in multiple test runs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runIds, lookbackDays = 30 } = body;

    if (!runIds || !Array.isArray(runIds) || runIds.length === 0) {
      return NextResponse.json(
        { error: 'runIds array is required' },
        { status: 400 }
      );
    }

    // Fetch all runs
    const { data: runs, error: runsError } = await supabase
      .from('test_runs')
      .select('id, status, created_at, duration_ms, suite_id')
      .in('id', runIds);

    if (runsError) {
      return NextResponse.json(
        { error: 'Failed to fetch test runs' },
        { status: 500 }
      );
    }

    const anomalies = [];

    for (const run of runs || []) {
      try {
        // Get test results for this run
        const { data: results } = await supabase
          .from('test_results')
          .select('id, status, errors, console_logs, test_name')
          .eq('run_id', run.id);

        const totalTests = results?.length || 0;
        const passedTests = results?.filter(r => r.status === 'pass').length || 0;
        const failedTests = results?.filter(r => r.status === 'fail').length || 0;

        const allErrors = results?.flatMap(r => r.errors || []) || [];
        const allLogs = results?.flatMap(r => r.console_logs || []) || [];
        const testNames = results?.map(r => r.test_name).filter(Boolean) as string[] || [];

        const runData: TestRunLogData = {
          runId: run.id,
          status: run.status,
          createdAt: run.created_at,
          durationMs: run.duration_ms,
          totalTests,
          passedTests,
          failedTests,
          errors: allErrors,
          consoleLogs: allLogs,
          testNames,
        };

        // Fetch historical runs for baseline
        const historicalRuns = await fetchHistoricalTestRuns(
          run.suite_id,
          lookbackDays,
          20
        );

        // Filter out the current run from historical data
        const baselineRuns = historicalRuns.filter(r => r.runId !== run.id);

        // Detect anomalies
        const anomalyResult = await detectAnomalies(runData, baselineRuns);

        anomalies.push(anomalyResult);
      } catch (error) {
        console.error(`Error processing run ${run.id}:`, error);
        anomalies.push({
          runId: run.id,
          isAnomalous: false,
          confidence: 0,
          explanation: `Error: ${(error as Error).message}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: anomalies,
    });
  } catch (error) {
    console.error('Error in batch anomaly detection:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}
