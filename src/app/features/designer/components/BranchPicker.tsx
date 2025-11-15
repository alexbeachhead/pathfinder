'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/stores/appStore';
import { GitBranch, Plus, Check, ChevronDown } from 'lucide-react';
import { TestSuiteBranch } from '@/lib/types';
import { getBranches, createBranch, getOrCreateDefaultBranch } from '@/lib/supabase/branches';
import { ThemedButton } from '@/components/ui/ThemedButton';

interface BranchPickerProps {
  suiteId: string;
  selectedBranchId?: string;
  onBranchChange: (branchId: string) => void;
}

export function BranchPicker({ suiteId, selectedBranchId, onBranchChange }: BranchPickerProps) {
  const { currentTheme } = useTheme();
  const [branches, setBranches] = useState<TestSuiteBranch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, [suiteId]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      // Ensure default branch exists
      const defaultBranch = await getOrCreateDefaultBranch(suiteId);
      const allBranches = await getBranches(suiteId);
      setBranches(allBranches);

      // Auto-select default if no branch selected
      if (!selectedBranchId && defaultBranch) {
        onBranchChange(defaultBranch.id);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;

    try {
      const branchId = await createBranch({
        suite_id: suiteId,
        branch_name: newBranchName,
        parent_branch_id: selectedBranchId,
        description: `Branch created from ${selectedBranch?.branch_name || 'main'}`,
      });

      await loadBranches();
      onBranchChange(branchId);
      setNewBranchName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  if (loading) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: `${currentTheme.colors.surface}80`,
          borderColor: currentTheme.colors.border,
          borderWidth: '1px',
          borderStyle: 'solid',
          color: currentTheme.colors.text.secondary,
        }}
      >
        Loading branches...
      </div>
    );
  }

  return (
    <div className="relative" data-testid="branch-picker">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-full"
        style={{
          background: `${currentTheme.colors.surface}80`,
          borderColor: currentTheme.colors.border,
          borderWidth: '1px',
          borderStyle: 'solid',
          color: currentTheme.colors.text.primary,
        }}
        data-testid="branch-picker-toggle"
      >
        <GitBranch className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
        <span className="flex-1 text-left">
          {selectedBranch?.branch_name || 'Select branch'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
          style={{
            background: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
          data-testid="branch-picker-dropdown"
        >
          {/* Branch List */}
          <div className="p-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  onBranchChange(branch.id);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded w-full text-left text-sm transition-all"
                style={{
                  background:
                    branch.id === selectedBranchId
                      ? `${currentTheme.colors.primary}20`
                      : 'transparent',
                  color: currentTheme.colors.text.primary,
                }}
                data-testid={`branch-option-${branch.branch_name}`}
              >
                <GitBranch className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
                <span className="flex-1">{branch.branch_name}</span>
                {branch.is_default && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: `${currentTheme.colors.secondary}20`,
                      color: currentTheme.colors.secondary,
                    }}
                  >
                    default
                  </span>
                )}
                {branch.id === selectedBranchId && (
                  <Check className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
                )}
              </button>
            ))}
          </div>

          {/* Create New Branch */}
          <div
            className="border-t p-2"
            style={{
              borderColor: currentTheme.colors.border,
            }}
          >
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-3 py-2 rounded w-full text-left text-sm transition-all"
                style={{
                  color: currentTheme.colors.accent,
                }}
                data-testid="create-branch-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Create new branch</span>
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Branch name"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateBranch();
                    if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewBranchName('');
                    }
                  }}
                  autoFocus
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    background: `${currentTheme.colors.background}80`,
                    borderColor: currentTheme.colors.border,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: currentTheme.colors.text.primary,
                  }}
                  data-testid="new-branch-input"
                />
                <div className="flex gap-2">
                  <ThemedButton
                    size="sm"
                    variant="primary"
                    onClick={handleCreateBranch}
                    disabled={!newBranchName.trim()}
                    data-testid="confirm-create-branch-btn"
                  >
                    Create
                  </ThemedButton>
                  <ThemedButton
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsCreating(false);
                      setNewBranchName('');
                    }}
                    data-testid="cancel-create-branch-btn"
                  >
                    Cancel
                  </ThemedButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
