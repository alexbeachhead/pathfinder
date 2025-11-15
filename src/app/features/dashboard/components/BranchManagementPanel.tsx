'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/stores/appStore';
import { TestSuiteBranch, TestSuite, BranchDiff } from '@/lib/types';
import { getBranches, calculateDiff } from '@/lib/supabase/branches';
import { getTestSuites } from '@/lib/supabase/testSuites';
import { GitBranch, GitMerge, FileText } from 'lucide-react';
import { ThemedCard, ThemedCardHeader } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { BranchPicker } from '../../designer/components/BranchPicker';
import { DiffViewer } from '../../designer/components/DiffViewer';
import { MergeRequestManager } from '../../designer/components/MergeRequestManager';

export function BranchManagementPanel() {
  const { currentTheme } = useTheme();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<string>('');
  const [branches, setBranches] = useState<TestSuiteBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [compareBranch, setCompareBranch] = useState<string>('');
  const [diffs, setDiffs] = useState<BranchDiff[]>([]);
  const [showDiffs, setShowDiffs] = useState(false);
  const [showMergeManager, setShowMergeManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestSuites();
  }, []);

  useEffect(() => {
    if (selectedSuite) {
      loadBranches();
    }
  }, [selectedSuite]);

  const loadTestSuites = async () => {
    try {
      const suites = await getTestSuites();
      setTestSuites(suites);
      if (suites.length > 0) {
        setSelectedSuite(suites[0].id);
      }
    } catch (error) {
      console.error('Failed to load test suites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const branchList = await getBranches(selectedSuite);
      setBranches(branchList);
      if (branchList.length > 0 && !selectedBranch) {
        const defaultBranch = branchList.find((b) => b.is_default);
        setSelectedBranch(defaultBranch?.id || branchList[0].id);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const handleCompareBranches = async () => {
    if (!selectedBranch || !compareBranch) return;

    try {
      const diffResults = await calculateDiff(selectedBranch, compareBranch);
      setDiffs(diffResults);
      setShowDiffs(true);
    } catch (error) {
      console.error('Failed to calculate diff:', error);
    }
  };

  if (loading) {
    return (
      <ThemedCard variant="glass" data-testid="branch-management-loading">
        <div
          className="text-center py-8"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          Loading branch management...
        </div>
      </ThemedCard>
    );
  }

  if (testSuites.length === 0) {
    return (
      <ThemedCard variant="glass" data-testid="branch-management-empty">
        <ThemedCardHeader
          icon={<GitBranch className="w-5 h-5" />}
          title="Branch Management"
        />
        <div
          className="text-center py-8"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          No test suites available. Create a test suite first.
        </div>
      </ThemedCard>
    );
  }

  return (
    <div className="space-y-6" data-testid="branch-management-panel">
      {/* Suite Selector */}
      <ThemedCard variant="glass">
        <ThemedCardHeader
          icon={<GitBranch className="w-5 h-5" />}
          title="Branch Management"
          subtitle="Manage test suite branches and merge changes"
        />

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Test Suite
            </label>
            <select
              value={selectedSuite}
              onChange={(e) => {
                setSelectedSuite(e.target.value);
                setSelectedBranch('');
                setCompareBranch('');
                setShowDiffs(false);
              }}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
                borderWidth: '1px',
                borderStyle: 'solid',
                color: currentTheme.colors.text.primary,
              }}
              data-testid="suite-select"
            >
              {testSuites.map((suite) => (
                <option key={suite.id} value={suite.id}>
                  {suite.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSuite && (
            <>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  Current Branch
                </label>
                <BranchPicker
                  suiteId={selectedSuite}
                  selectedBranchId={selectedBranch}
                  onBranchChange={setSelectedBranch}
                />
              </div>

              <div className="flex gap-3">
                <ThemedButton
                  variant="secondary"
                  onClick={() => setShowDiffs(!showDiffs)}
                  leftIcon={<FileText className="w-4 h-4" />}
                  data-testid="toggle-diff-btn"
                >
                  {showDiffs ? 'Hide' : 'Show'} Branch Comparison
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  onClick={() => setShowMergeManager(!showMergeManager)}
                  leftIcon={<GitMerge className="w-4 h-4" />}
                  data-testid="toggle-merge-btn"
                >
                  {showMergeManager ? 'Hide' : 'Show'} Merge Requests
                </ThemedButton>
              </div>
            </>
          )}
        </div>
      </ThemedCard>

      {/* Branch Comparison */}
      {showDiffs && selectedSuite && (
        <ThemedCard variant="bordered">
          <ThemedCardHeader
            icon={<FileText className="w-5 h-5" />}
            title="Branch Comparison"
            subtitle="Compare changes between branches"
          />

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text.primary }}
              >
                Compare with Branch
              </label>
              <select
                value={compareBranch}
                onChange={(e) => setCompareBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: currentTheme.colors.text.primary,
                }}
                data-testid="compare-branch-select"
              >
                <option value="">Select branch to compare</option>
                {branches
                  .filter((b) => b.id !== selectedBranch)
                  .map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
              </select>
            </div>

            <ThemedButton
              variant="primary"
              onClick={handleCompareBranches}
              disabled={!compareBranch}
              data-testid="compare-branches-btn"
            >
              Compare Branches
            </ThemedButton>

            {diffs.length > 0 && (
              <div className="mt-6">
                <DiffViewer diffs={diffs} />
              </div>
            )}
          </div>
        </ThemedCard>
      )}

      {/* Merge Request Manager */}
      {showMergeManager && selectedSuite && selectedBranch && (
        <MergeRequestManager suiteId={selectedSuite} currentBranchId={selectedBranch} />
      )}
    </div>
  );
}
