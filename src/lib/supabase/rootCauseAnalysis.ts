/**
 * Supabase helper functions for root cause analysis
 *
 * Provides database operations for:
 * - Storing and retrieving failure embeddings
 * - Managing root cause analyses
 * - Tracking failure resolutions
 * - Querying similar failures
 */

import { supabase } from '../supabase';
import {
  RootCauseAnalysis,
  ProbableCause,
  RemediationSuggestion,
  SimilarFailure,
} from '../ai/rootCauseAnalysis';

/**
 * Store a failure embedding in the database
 */
export async function storeFailureEmbedding(
  resultId: string,
  errorMessage: string,
  stackTrace: string | undefined,
  embedding: number[]
): Promise<string> {
  const { data, error } = await supabase
    .from('test_failure_embeddings')
    .insert({
      result_id: resultId,
      error_message: errorMessage,
      stack_trace: stackTrace,
      embedding,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to store failure embedding: ${error.message}`);
  }

  return data.id;
}

/**
 * Find similar failures using vector similarity search
 * Note: This requires the pgvector extension and proper indexing
 */
export async function findSimilarFailuresByEmbedding(
  embedding: number[],
  limit: number = 5,
  threshold: number = 0.7
): Promise<SimilarFailure[]> {
  // Use RPC function for vector similarity search
  // This assumes you have a PostgreSQL function set up for cosine similarity
  const { data, error } = await supabase.rpc('find_similar_failures', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    console.error('Error finding similar failures:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    result_id: row.result_id,
    test_name: row.test_name || 'Unknown Test',
    similarity_score: row.similarity,
    error_message: row.error_message || '',
    resolution: row.resolution,
    resolved_at: row.resolved_at,
  }));
}

/**
 * Save a root cause analysis to the database
 */
export async function saveRootCauseAnalysis(
  analysis: RootCauseAnalysis
): Promise<string> {
  const { data, error } = await supabase
    .from('root_cause_analyses')
    .insert({
      result_id: analysis.result_id,
      probable_causes: analysis.probable_causes,
      remediation_suggestions: analysis.remediation_suggestions,
      similar_failures: analysis.similar_failures,
      ai_model: analysis.ai_model,
      confidence_score: analysis.confidence_score,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save root cause analysis: ${error.message}`);
  }

  return data.id;
}

/**
 * Get a root cause analysis for a test result
 */
export async function getRootCauseAnalysis(
  resultId: string
): Promise<RootCauseAnalysis | null> {
  const { data, error } = await supabase
    .from('root_cause_analyses')
    .select('*')
    .eq('result_id', resultId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get root cause analysis: ${error.message}`);
  }

  return data as RootCauseAnalysis;
}

/**
 * Save a failure resolution
 */
export async function saveFailureResolution(
  resultId: string,
  rootCause: string,
  solutionApplied: string,
  resolutionNotes?: string,
  resolvedBy?: string
): Promise<string> {
  const { data, error } = await supabase
    .from('failure_resolutions')
    .insert({
      result_id: resultId,
      root_cause: rootCause,
      solution_applied: solutionApplied,
      resolution_notes: resolutionNotes,
      resolved_by: resolvedBy,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save failure resolution: ${error.message}`);
  }

  return data.id;
}

/**
 * Get all failure resolutions for a test result
 */
export async function getFailureResolutions(
  resultId: string
): Promise<Array<{
  id: string;
  root_cause: string;
  solution_applied: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at: string;
}>> {
  const { data, error } = await supabase
    .from('failure_resolutions')
    .select('*')
    .eq('result_id', resultId)
    .order('resolved_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get failure resolutions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get statistics about root cause analyses
 */
export async function getRootCauseAnalysisStats(
  suiteId: string
): Promise<{
  total_analyses: number;
  avg_confidence: number;
  most_common_causes: Array<{ category: string; count: number }>;
  resolution_rate: number;
}> {
  // Get all analyses for a test suite
  const { data: analyses, error: analysesError } = await supabase
    .from('root_cause_analyses')
    .select(
      `
      *,
      test_results!inner(
        run_id,
        test_runs!inner(suite_id)
      )
    `
    )
    .eq('test_results.test_runs.suite_id', suiteId);

  if (analysesError) {
    throw new Error(`Failed to get analysis stats: ${analysesError.message}`);
  }

  // Count resolutions
  const { count: resolutionCount, error: resolutionError } = await supabase
    .from('failure_resolutions')
    .select('*', { count: 'exact', head: true })
    .in(
      'result_id',
      (analyses || []).map((a: any) => a.result_id)
    );

  if (resolutionError) {
    console.error('Error counting resolutions:', resolutionError);
  }

  // Calculate statistics
  const totalAnalyses = analyses?.length || 0;
  const avgConfidence =
    totalAnalyses > 0
      ? (analyses || []).reduce((sum: number, a: any) => sum + (a.confidence_score || 0), 0) /
        totalAnalyses
      : 0;

  // Count cause categories
  const causeCounts: Record<string, number> = {};
  (analyses || []).forEach((analysis: any) => {
    (analysis.probable_causes || []).forEach((cause: ProbableCause) => {
      causeCounts[cause.category] = (causeCounts[cause.category] || 0) + 1;
    });
  });

  const mostCommonCauses = Object.entries(causeCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const resolutionRate = totalAnalyses > 0 ? (resolutionCount || 0) / totalAnalyses : 0;

  return {
    total_analyses: totalAnalyses,
    avg_confidence: avgConfidence,
    most_common_causes: mostCommonCauses,
    resolution_rate: resolutionRate,
  };
}

/**
 * Delete old embeddings to manage storage (optional cleanup function)
 */
export async function cleanupOldEmbeddings(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('test_failure_embeddings')
    .delete()
    .lt('created_at', cutoffDate.toISOString())
    .select('id');

  if (error) {
    throw new Error(`Failed to cleanup old embeddings: ${error.message}`);
  }

  return data?.length || 0;
}
