'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/stores/appStore';
import { MergeRequest, TestSuiteBranch } from '@/lib/types';
import {
  getMergeRequests,
  createMergeRequest,
  resolveConflicts,
  executeMerge,
  getBranches,
} from '@/lib/supabase/branches';
import { GitMerge, Plus, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ThemedCard, ThemedCardHeader } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { MergeConflictResolver } from './MergeConflictResolver';

interface MergeRequestManagerProps {
  suiteId: string;
  currentBranchId: string;
}

export function MergeRequestManager({ suiteId, currentBranchId }: MergeRequestManagerProps) {
  const { currentTheme } = useTheme();
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [branches, setBranches] = useState<TestSuiteBranch[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTargetBranch, setSelectedTargetBranch] = useState<string>('');
  const [resolvingRequest, setResolvingRequest] = useState<MergeRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [suiteId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requests, branchList] = await Promise.all([
        getMergeRequests(suiteId),
        getBranches(suiteId),
      ]);
      setMergeRequests(requests);
      setBranches(branchList);
    } catch (error) {
      console.error('Failed to load merge requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMergeRequest = async () => {
    if (!selectedTargetBranch) return;

    try {
      const currentBranch = branches.find((b) => b.id === currentBranchId);
      const targetBranch = branches.find((b) => b.id === selectedTargetBranch);

      await createMergeRequest({
        suite_id: suiteId,
        source_branch_id: currentBranchId,
        target_branch_id: selectedTargetBranch,
        title: `Merge ${currentBranch?.branch_name} into ${targetBranch?.branch_name}`,
        description: 'Merge request created from Designer',
      });

      await loadData();
      setIsCreating(false);
      setSelectedTargetBranch('');
    } catch (error) {
      console.error('Failed to create merge request:', error);
    }
  };

  const handleResolveConflicts = async (request: MergeRequest, resolutions: any[]) => {
    try {
      await resolveConflicts(request.id, resolutions);
      await loadData();
      setResolvingRequest(null);
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
    }
  };

  const handleMerge = async (requestId: string) => {
    try {
      await executeMerge(requestId);
      await loadData();
    } catch (error) {
      console.error('Failed to execute merge:', error);
    }
  };

  const getStatusIcon = (status: MergeRequest['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'merged':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'conflict':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (resolvingRequest && resolvingRequest.conflicts) {
    const sourceBranch = branches.find((b) => b.id === resolvingRequest.source_branch_id);
    const targetBranch = branches.find((b) => b.id === resolvingRequest.target_branch_id);

    return (
      <MergeConflictResolver
        conflicts={resolvingRequest.conflicts}
        sourceBranchName={sourceBranch?.branch_name || 'source'}
        targetBranchName={targetBranch?.branch_name || 'target'}
        onResolve={(resolutions) => handleResolveConflicts(resolvingRequest, resolutions)}
        onCancel={() => setResolvingRequest(null)}
      />
    );
  }

  return (
    <div className="space-y-4" data-testid="merge-request-manager">
      <ThemedCard variant="glass">
        <ThemedCardHeader
          icon={<GitMerge className="w-5 h-5" />}
          title="Merge Requests"
          subtitle={`${mergeRequests.length} total`}
          action={
            !isCreating && (
              <ThemedButton
                size="sm"
                variant="primary"
                onClick={() => setIsCreating(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                data-testid="create-merge-request-btn"
              >
                New Merge Request
              </ThemedButton>
            )
          }
        />

        {isCreating && (
          <div
            className="mt-4 p-4 rounded-lg"
            style={{
              background: `${currentTheme.colors.background}40`,
              borderColor: currentTheme.colors.border,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
            data-testid="create-merge-request-form"
          >
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Merge into:
            </label>
            <select
              value={selectedTargetBranch}
              onChange={(e) => setSelectedTargetBranch(e.target.value)}
              className="w-full px-3 py-2 rounded mb-3"
              style={{
                background: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
                borderWidth: '1px',
                borderStyle: 'solid',
                color: currentTheme.colors.text.primary,
              }}
              data-testid="target-branch-select"
            >
              <option value="">Select target branch</option>
              {branches
                .filter((b) => b.id !== currentBranchId)
                .map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
            </select>
            <div className="flex gap-2">
              <ThemedButton
                size="sm"
                variant="primary"
                onClick={handleCreateMergeRequest}
                disabled={!selectedTargetBranch}
                data-testid="submit-merge-request-btn"
              >
                Create Request
              </ThemedButton>
              <ThemedButton
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setSelectedTargetBranch('');
                }}
                data-testid="cancel-merge-request-btn"
              >
                Cancel
              </ThemedButton>
            </div>
          </div>
        )}
      </ThemedCard>

      {loading ? (
        <ThemedCard variant="glass">
          <div className="text-center py-8" style={{ color: currentTheme.colors.text.secondary }}>
            Loading merge requests...
          </div>
        </ThemedCard>
      ) : mergeRequests.length === 0 ? (
        <ThemedCard variant="glass">
          <div className="text-center py-8" style={{ color: currentTheme.colors.text.secondary }}>
            No merge requests yet
          </div>
        </ThemedCard>
      ) : (
        <div className="space-y-3">
          {mergeRequests.map((request) => {
            const sourceBranch = branches.find((b) => b.id === request.source_branch_id);
            const targetBranch = branches.find((b) => b.id === request.target_branch_id);

            return (
              <ThemedCard
                key={request.id}
                variant="bordered"
                hoverable
                data-testid={`merge-request-${request.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(request.status)}
                      <h4
                        className="font-semibold"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        {request.title}
                      </h4>
                    </div>
                    <div
                      className="text-sm mb-2"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      {sourceBranch?.branch_name} → {targetBranch?.branch_name}
                    </div>
                    {request.description && (
                      <p
                        className="text-sm"
                        style={{ color: currentTheme.colors.text.tertiary }}
                      >
                        {request.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {request.status === 'conflict' && (
                      <ThemedButton
                        size="sm"
                        variant="secondary"
                        onClick={() => setResolvingRequest(request)}
                        data-testid={`resolve-btn-${request.id}`}
                      >
                        Resolve Conflicts
                      </ThemedButton>
                    )}
                    {request.status === 'open' && (
                      <ThemedButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleMerge(request.id)}
                        leftIcon={<GitMerge className="w-4 h-4" />}
                        data-testid={`merge-btn-${request.id}`}
                      >
                        Merge
                      </ThemedButton>
                    )}
                  </div>
                </div>
              </ThemedCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
