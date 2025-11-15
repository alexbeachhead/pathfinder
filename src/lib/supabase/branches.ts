import { supabase } from '../supabase';
import {
  TestSuiteBranch,
  BranchSnapshot,
  BranchDiff,
  MergeRequest,
  BranchWithDetails,
  TestCode,
  MergeConflict,
  ConflictResolution,
  DiffChanges,
  CodeChange,
} from '../types';
import { getLatestTestCode, getTestSuite } from './testSuites';

/**
 * Create a new branch for a test suite
 */
export async function createBranch(data: {
  suite_id: string;
  branch_name: string;
  parent_branch_id?: string;
  description?: string;
  created_by?: string;
}): Promise<string> {
  const { data: branch, error } = await supabase
    .from('test_suite_branches')
    .insert({
      suite_id: data.suite_id,
      branch_name: data.branch_name,
      parent_branch_id: data.parent_branch_id,
      description: data.description,
      created_by: data.created_by,
      is_default: false,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create branch: ${error.message}`);
  }

  // Create initial snapshot
  const testCode = await getLatestTestCode(data.suite_id);
  const suite = await getTestSuite(data.suite_id);

  if (testCode || suite) {
    await createSnapshot({
      branch_id: branch.id,
      test_code_id: testCode?.id,
      suite_config: suite
        ? {
            name: suite.name,
            target_url: suite.target_url,
            description: suite.description,
          }
        : undefined,
    });
  }

  return branch.id;
}

/**
 * Get all branches for a test suite
 */
export async function getBranches(suiteId: string): Promise<TestSuiteBranch[]> {
  const { data, error } = await supabase
    .from('test_suite_branches')
    .select('*')
    .eq('suite_id', suiteId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch branches: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single branch by ID
 */
export async function getBranch(branchId: string): Promise<TestSuiteBranch | null> {
  const { data, error } = await supabase
    .from('test_suite_branches')
    .select('*')
    .eq('id', branchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch branch: ${error.message}`);
  }

  return data;
}

/**
 * Get branch with detailed information
 */
export async function getBranchWithDetails(branchId: string): Promise<BranchWithDetails | null> {
  const branch = await getBranch(branchId);
  if (!branch) return null;

  const snapshot = await getLatestSnapshot(branchId);
  let testCode: TestCode | null = null;

  if (snapshot?.test_code_id) {
    const { data } = await supabase
      .from('test_code')
      .select('*')
      .eq('id', snapshot.test_code_id)
      .single();
    testCode = data;
  }

  return {
    ...branch,
    latestSnapshot: snapshot || undefined,
    testCode: testCode || undefined,
  };
}

/**
 * Get or create default branch for a suite
 */
export async function getOrCreateDefaultBranch(suiteId: string): Promise<TestSuiteBranch> {
  // Check if default branch exists
  const { data: existing } = await supabase
    .from('test_suite_branches')
    .select('*')
    .eq('suite_id', suiteId)
    .eq('is_default', true)
    .single();

  if (existing) {
    return existing;
  }

  // Create default branch
  const { data: branch, error: createError } = await supabase
    .from('test_suite_branches')
    .insert({
      suite_id: suiteId,
      branch_name: 'master',
      is_default: true,
      description: 'Default branch',
    })
    .select('*')
    .single();

  if (createError) {
    throw new Error(`Failed to create default branch: ${createError.message}`);
  }

  return branch;
}

/**
 * Create a snapshot of a branch state
 */
export async function createSnapshot(data: {
  branch_id: string;
  test_code_id?: string;
  suite_config?: Record<string, unknown>;
}): Promise<string> {
  const { data: snapshot, error } = await supabase
    .from('snapshots')
    .insert(data)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create snapshot: ${error.message}`);
  }

  return snapshot.id;
}

/**
 * Get latest snapshot for a branch
 */
export async function getLatestSnapshot(branchId: string): Promise<BranchSnapshot | null> {
  const { data, error } = await supabase
    .from('branch_snapshots')
    .select('*')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch snapshot: ${error.message}`);
  }

  return data;
}

/**
 * Calculate diff between two branches
 */
export async function calculateDiff(
  sourceBranchId: string,
  targetBranchId: string
): Promise<BranchDiff[]> {
  const sourceBranch = await getBranchWithDetails(sourceBranchId);
  const targetBranch = await getBranchWithDetails(targetBranchId);

  if (!sourceBranch || !targetBranch) {
    throw new Error('Source or target branch not found');
  }

  const diffs: BranchDiff[] = [];

  // Calculate code diff
  if (sourceBranch.testCode || targetBranch.testCode) {
    const sourceCode = sourceBranch.testCode?.code || '';
    const targetCode = targetBranch.testCode?.code || '';

    const changes = calculateCodeDiff(sourceCode, targetCode);

    // Save diff to database
    const { data: diff, error } = await supabase
      .from('branch_diffs')
      .insert({
        source_branch_id: sourceBranchId,
        target_branch_id: targetBranchId,
        diff_type: 'code',
        changes,
      })
      .select('*')
      .single();

    if (!error && diff) {
      diffs.push(diff);
    }
  }

  // Calculate config diff
  if (sourceBranch.latestSnapshot?.suite_config || targetBranch.latestSnapshot?.suite_config) {
    const sourceConfig = sourceBranch.latestSnapshot?.suite_config || {};
    const targetConfig = targetBranch.latestSnapshot?.suite_config || {};

    const changes = calculateConfigDiff(sourceConfig, targetConfig);

    if (changes.additions?.length || changes.deletions?.length || changes.modifications?.length) {
      const { data: diff, error } = await supabase
        .from('branch_diffs')
        .insert({
          source_branch_id: sourceBranchId,
          target_branch_id: targetBranchId,
          diff_type: 'config',
          changes,
        })
        .select('*')
        .single();

      if (!error && diff) {
        diffs.push(diff);
      }
    }
  }

  return diffs;
}

/**
 * Calculate code differences (simple line-based diff)
 */
function calculateCodeDiff(sourceCode: string, targetCode: string): DiffChanges {
  const sourceLines = sourceCode.split('\n');
  const targetLines = targetCode.split('\n');

  const additions: CodeChange[] = [];
  const deletions: CodeChange[] = [];
  const modifications: CodeChange[] = [];

  const maxLength = Math.max(sourceLines.length, targetLines.length);

  for (let i = 0; i < maxLength; i++) {
    const sourceLine = sourceLines[i];
    const targetLine = targetLines[i];

    if (sourceLine === undefined && targetLine !== undefined) {
      additions.push({
        line: i + 1,
        content: targetLine,
        type: 'add',
      });
    } else if (sourceLine !== undefined && targetLine === undefined) {
      deletions.push({
        line: i + 1,
        content: sourceLine,
        type: 'remove',
      });
    } else if (sourceLine !== targetLine) {
      modifications.push({
        line: i + 1,
        content: targetLine,
        type: 'modify',
        context: sourceLine,
      });
    }
  }

  return {
    additions,
    deletions,
    modifications,
    summary: `${additions.length} additions, ${deletions.length} deletions, ${modifications.length} modifications`,
  };
}

/**
 * Calculate configuration differences
 */
function calculateConfigDiff(
  sourceConfig: Record<string, unknown>,
  targetConfig: Record<string, unknown>
): DiffChanges {
  const additions: CodeChange[] = [];
  const deletions: CodeChange[] = [];
  const modifications: CodeChange[] = [];

  const allKeys = new Set([...Object.keys(sourceConfig), ...Object.keys(targetConfig)]);

  allKeys.forEach((key) => {
    const sourceValue = sourceConfig[key];
    const targetValue = targetConfig[key];

    if (sourceValue === undefined && targetValue !== undefined) {
      additions.push({
        content: `${key}: ${JSON.stringify(targetValue)}`,
        type: 'add',
      });
    } else if (sourceValue !== undefined && targetValue === undefined) {
      deletions.push({
        content: `${key}: ${JSON.stringify(sourceValue)}`,
        type: 'remove',
      });
    } else if (JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
      modifications.push({
        content: `${key}: ${JSON.stringify(targetValue)}`,
        type: 'modify',
        context: `${key}: ${JSON.stringify(sourceValue)}`,
      });
    }
  });

  return {
    additions,
    deletions,
    modifications,
    summary: `${additions.length} additions, ${deletions.length} deletions, ${modifications.length} modifications`,
  };
}

/**
 * Create a merge request
 */
export async function createMergeRequest(data: {
  suite_id: string;
  source_branch_id: string;
  target_branch_id: string;
  title: string;
  description?: string;
  created_by?: string;
}): Promise<string> {
  // Calculate diffs
  const diffs = await calculateDiff(data.source_branch_id, data.target_branch_id);

  // Detect conflicts
  const conflicts = detectConflicts(diffs);

  const { data: mergeRequest, error } = await supabase
    .from('merge_requests')
    .insert({
      ...data,
      status: conflicts.length > 0 ? 'conflict' : 'open',
      conflicts: conflicts.length > 0 ? conflicts : null,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create merge request: ${error.message}`);
  }

  // Record history
  await createMergeHistory({
    merge_request_id: mergeRequest.id,
    action: 'created',
    actor: data.created_by,
    details: { diffs_count: diffs.length },
  });

  return mergeRequest.id;
}

/**
 * Detect merge conflicts
 */
function detectConflicts(diffs: BranchDiff[]): MergeConflict[] {
  const conflicts: MergeConflict[] = [];

  diffs.forEach((diff) => {
    if (diff.diff_type === 'code') {
      const modifications = diff.changes.modifications || [];
      modifications.forEach((mod: CodeChange) => {
        conflicts.push({
          type: 'code',
          section: `Line ${mod.line}`,
          sourceValue: mod.context || '',
          targetValue: mod.content || '',
          lineNumber: mod.line,
          description: 'Code modification conflict',
        });
      });
    } else if (diff.diff_type === 'config') {
      const modifications = diff.changes.modifications || [];
      modifications.forEach((mod: CodeChange) => {
        conflicts.push({
          type: 'config',
          section: mod.content.split(':')[0] || 'Unknown',
          sourceValue: mod.context || '',
          targetValue: mod.content || '',
          description: 'Configuration conflict',
        });
      });
    }
  });

  return conflicts;
}

/**
 * Get merge requests for a suite
 */
export async function getMergeRequests(suiteId: string): Promise<MergeRequest[]> {
  const { data, error } = await supabase
    .from('merge_requests')
    .select('*')
    .eq('suite_id', suiteId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch merge requests: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single merge request
 */
export async function getMergeRequest(requestId: string): Promise<MergeRequest | null> {
  const { data, error } = await supabase
    .from('merge_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch merge request: ${error.message}`);
  }

  return data;
}

/**
 * Resolve conflicts in a merge request
 */
export async function resolveConflicts(
  requestId: string,
  resolutions: ConflictResolution[],
  actor?: string
): Promise<void> {
  const { error } = await supabase
    .from('merge_requests')
    .update({
      resolution: resolutions,
      status: 'open',
    })
    .eq('id', requestId);

  if (error) {
    throw new Error(`Failed to resolve conflicts: ${error.message}`);
  }

  // Record history
  await createMergeHistory({
    merge_request_id: requestId,
    action: 'resolved_conflict',
    actor,
    details: { resolutions_count: resolutions.length },
  });
}

/**
 * Execute merge
 */
export async function executeMerge(
  requestId: string,
  merged_by?: string
): Promise<void> {
  const mergeRequest = await getMergeRequest(requestId);
  if (!mergeRequest) {
    throw new Error('Merge request not found');
  }

  if (mergeRequest.status === 'conflict' && !mergeRequest.resolution) {
    throw new Error('Cannot merge: unresolved conflicts');
  }

  // Get source branch details
  const sourceBranch = await getBranchWithDetails(mergeRequest.source_branch_id);
  if (!sourceBranch) {
    throw new Error('Source branch not found');
  }

  // Apply changes to target branch
  if (sourceBranch.testCode) {
    // Create new snapshot for target branch with merged code
    await createSnapshot({
      branch_id: mergeRequest.target_branch_id,
      test_code_id: sourceBranch.testCode.id,
      suite_config: sourceBranch.latestSnapshot?.suite_config,
    });
  }

  // Update merge request status
  const { error } = await supabase
    .from('merge_requests')
    .update({
      status: 'merged',
      merged_by,
      merged_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) {
    throw new Error(`Failed to complete merge: ${error.message}`);
  }

  // Record history
  await createMergeHistory({
    merge_request_id: requestId,
    action: 'merged',
    actor: merged_by,
  });
}

/**
 * Create merge history entry
 */
async function createMergeHistory(data: {
  merge_request_id: string;
  action: 'created' | 'resolved_conflict' | 'merged' | 'closed';
  actor?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await supabase.from('merge_history').insert(data);

  if (error) {
    console.error('Failed to create merge history:', error);
  }
}

/**
 * Delete a branch
 */
export async function deleteBranch(branchId: string): Promise<void> {
  const { error } = await supabase
    .from('test_suite_branches')
    .delete()
    .eq('id', branchId);

  if (error) {
    throw new Error(`Failed to delete branch: ${error.message}`);
  }
}

/**
 * Update branch details
 */
export async function updateBranch(
  branchId: string,
  updates: Partial<Pick<TestSuiteBranch, 'branch_name' | 'description'>>
): Promise<void> {
  const { error } = await supabase
    .from('test_suite_branches')
    .update(updates)
    .eq('id', branchId);

  if (error) {
    throw new Error(`Failed to update branch: ${error.message}`);
  }
}
