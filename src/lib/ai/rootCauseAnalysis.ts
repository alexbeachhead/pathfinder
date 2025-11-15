/**
 * AI Root-Cause Analysis Service
 *
 * Provides AI-powered root cause analysis for test failures using:
 * - Embedding generation for failure logs and stack traces
 * - Similarity search to find related past failures
 * - LLM-based analysis to generate probable causes and remediation suggestions
 */

import { TestResult, ErrorObject } from '@/lib/types';

export interface RootCauseAnalysis {
  id?: string;
  result_id: string;
  probable_causes: ProbableCause[];
  remediation_suggestions: RemediationSuggestion[];
  similar_failures: SimilarFailure[];
  ai_model: string;
  confidence_score: number;
  analyzed_at: string;
}

export interface ProbableCause {
  description: string;
  confidence: number; // 0.0 to 1.0
  category: 'code' | 'environment' | 'data' | 'infrastructure' | 'timeout' | 'dependency';
  evidence: string[];
}

export interface RemediationSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  steps: string[];
  code_example?: string;
}

export interface SimilarFailure {
  result_id: string;
  test_name: string;
  similarity_score: number; // 0.0 to 1.0
  error_message: string;
  resolution?: string;
  resolved_at?: string;
}

export interface FailureContext {
  test_name: string;
  viewport: string;
  viewport_size?: string;
  error_message: string;
  stack_trace?: string;
  console_logs?: Array<{ type: string; message: string; timestamp: string }>;
  duration_ms?: number;
}

/**
 * Generate embedding for a failure context
 */
export async function generateFailureEmbedding(context: FailureContext): Promise<number[]> {
  // Combine relevant failure information into a text for embedding
  const failureText = formatFailureForEmbedding(context);

  try {
    const response = await fetch('/api/ai/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: failureText }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate embedding');
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Find similar past failures using vector similarity search
 */
export async function findSimilarFailures(
  embedding: number[],
  limit: number = 5
): Promise<SimilarFailure[]> {
  try {
    const response = await fetch('/api/ai/similar-failures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embedding, limit }),
    });

    if (!response.ok) {
      throw new Error('Failed to find similar failures');
    }

    const data = await response.json();
    return data.similar_failures || [];
  } catch (error) {
    console.error('Error finding similar failures:', error);
    return [];
  }
}

/**
 * Generate root cause analysis using LLM
 */
export async function analyzeRootCause(
  context: FailureContext,
  similarFailures: SimilarFailure[]
): Promise<RootCauseAnalysis> {
  try {
    const response = await fetch('/api/ai/analyze-root-cause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context,
        similar_failures: similarFailures,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze root cause');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing root cause:', error);
    throw error;
  }
}

/**
 * Perform complete root cause analysis for a test failure
 */
export async function performRootCauseAnalysis(
  testResult: TestResult
): Promise<RootCauseAnalysis> {
  // Extract failure context from test result
  const context: FailureContext = {
    test_name: testResult.test_name || 'Unknown Test',
    viewport: testResult.viewport,
    viewport_size: testResult.viewport_size,
    error_message: testResult.errors?.[0]?.message || 'No error message',
    stack_trace: testResult.errors?.[0]?.stack,
    console_logs: testResult.console_logs,
    duration_ms: testResult.duration_ms,
  };

  // Step 1: Generate embedding for the failure
  const embedding = await generateFailureEmbedding(context);

  // Step 2: Find similar past failures
  const similarFailures = await findSimilarFailures(embedding);

  // Step 3: Analyze root cause using LLM
  const analysis = await analyzeRootCause(context, similarFailures);

  return {
    ...analysis,
    result_id: testResult.id,
  };
}

/**
 * Save failure resolution for future learning
 */
export async function saveFailureResolution(
  resultId: string,
  rootCause: string,
  solutionApplied: string,
  resolutionNotes?: string
): Promise<void> {
  try {
    const response = await fetch('/api/ai/save-resolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result_id: resultId,
        root_cause: rootCause,
        solution_applied: solutionApplied,
        resolution_notes: resolutionNotes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save resolution');
    }
  } catch (error) {
    console.error('Error saving resolution:', error);
    throw error;
  }
}

/**
 * Format failure context for embedding generation
 */
function formatFailureForEmbedding(context: FailureContext): string {
  const parts: string[] = [
    `Test: ${context.test_name}`,
    `Viewport: ${context.viewport} (${context.viewport_size || 'unknown'})`,
    `Error: ${context.error_message}`,
  ];

  if (context.stack_trace) {
    parts.push(`Stack Trace:\n${context.stack_trace.slice(0, 1000)}`); // Limit stack trace length
  }

  if (context.console_logs && context.console_logs.length > 0) {
    const errorLogs = context.console_logs
      .filter(log => log.type === 'error' || log.type === 'warn')
      .slice(0, 5)
      .map(log => `${log.type}: ${log.message}`)
      .join('\n');

    if (errorLogs) {
      parts.push(`Console Logs:\n${errorLogs}`);
    }
  }

  if (context.duration_ms) {
    parts.push(`Duration: ${context.duration_ms}ms`);
  }

  return parts.join('\n\n');
}

/**
 * Get cached root cause analysis if available
 */
export async function getCachedAnalysis(resultId: string): Promise<RootCauseAnalysis | null> {
  try {
    const response = await fetch(`/api/ai/root-cause-analysis/${resultId}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to get cached analysis');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error getting cached analysis:', error);
    return null;
  }
}
