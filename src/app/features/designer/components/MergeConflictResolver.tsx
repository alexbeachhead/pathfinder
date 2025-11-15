'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/stores/appStore';
import { MergeConflict, ConflictResolution } from '@/lib/types';
import { AlertTriangle, Check, X, GitMerge } from 'lucide-react';
import { ThemedCard, ThemedCardHeader } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';

interface MergeConflictResolverProps {
  conflicts: MergeConflict[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  onCancel: () => void;
  sourceBranchName: string;
  targetBranchName: string;
}

export function MergeConflictResolver({
  conflicts,
  onResolve,
  onCancel,
  sourceBranchName,
  targetBranchName,
}: MergeConflictResolverProps) {
  const { currentTheme } = useTheme();
  const [resolutions, setResolutions] = useState<ConflictResolution[]>([]);
  const [customValues, setCustomValues] = useState<Record<number, string>>({});

  const handleResolution = (
    conflictIndex: number,
    resolution: 'accept_source' | 'accept_target' | 'accept_both' | 'custom',
    customValue?: string
  ) => {
    const newResolutions = resolutions.filter((r) => r.conflictIndex !== conflictIndex);
    newResolutions.push({
      conflictIndex,
      resolution,
      customValue,
    });
    setResolutions(newResolutions);
  };

  const getResolution = (index: number) => {
    return resolutions.find((r) => r.conflictIndex === index);
  };

  const allResolved = conflicts.every((_, idx) => getResolution(idx));

  return (
    <div className="space-y-4" data-testid="merge-conflict-resolver">
      <ThemedCard variant="glow">
        <ThemedCardHeader
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Merge Conflicts Detected"
          subtitle={`${conflicts.length} conflict${conflicts.length > 1 ? 's' : ''} between ${sourceBranchName} and ${targetBranchName}`}
        />
        <p
          className="text-sm mt-2"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          Review each conflict and choose how to resolve it. You must resolve all conflicts before merging.
        </p>
      </ThemedCard>

      <div className="space-y-4">
        {conflicts.map((conflict, index) => {
          const resolution = getResolution(index);
          const isResolved = !!resolution;

          return (
            <ThemedCard
              key={index}
              variant={isResolved ? 'bordered' : 'glass'}
              data-testid={`conflict-${index}`}
            >
              <div className="space-y-4">
                {/* Conflict Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded uppercase"
                        style={{
                          background: `${currentTheme.colors.secondary}20`,
                          color: currentTheme.colors.secondary,
                        }}
                      >
                        {conflict.type}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        {conflict.section}
                      </span>
                    </div>
                    {conflict.description && (
                      <p
                        className="text-xs"
                        style={{ color: currentTheme.colors.text.tertiary }}
                      >
                        {conflict.description}
                      </p>
                    )}
                  </div>
                  {isResolved && (
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: '#22c55e20',
                        color: '#22c55e',
                      }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolved
                    </div>
                  )}
                </div>

                {/* Conflict Options */}
                <div className="grid gap-3">
                  {/* Source Version */}
                  <ConflictOption
                    title={`Keep ${sourceBranchName}`}
                    content={conflict.sourceValue}
                    isSelected={resolution?.resolution === 'accept_source'}
                    onSelect={() => handleResolution(index, 'accept_source')}
                    testId={`conflict-${index}-source`}
                  />

                  {/* Target Version */}
                  <ConflictOption
                    title={`Keep ${targetBranchName}`}
                    content={conflict.targetValue}
                    isSelected={resolution?.resolution === 'accept_target'}
                    onSelect={() => handleResolution(index, 'accept_target')}
                    testId={`conflict-${index}-target`}
                  />

                  {/* Both */}
                  <ConflictOption
                    title="Keep Both"
                    content={`${conflict.sourceValue}\n${conflict.targetValue}`}
                    isSelected={resolution?.resolution === 'accept_both'}
                    onSelect={() => handleResolution(index, 'accept_both')}
                    testId={`conflict-${index}-both`}
                  />

                  {/* Custom */}
                  <div
                    className="rounded-lg p-3 cursor-pointer transition-all"
                    style={{
                      background:
                        resolution?.resolution === 'custom'
                          ? `${currentTheme.colors.primary}10`
                          : `${currentTheme.colors.surface}40`,
                      borderColor:
                        resolution?.resolution === 'custom'
                          ? currentTheme.colors.primary
                          : currentTheme.colors.border,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                    }}
                    data-testid={`conflict-${index}-custom`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        checked={resolution?.resolution === 'custom'}
                        onChange={() => {
                          handleResolution(index, 'custom', customValues[index] || '');
                        }}
                        className="w-4 h-4"
                        data-testid={`conflict-${index}-custom-radio`}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        Custom Resolution
                      </span>
                    </div>
                    <textarea
                      value={customValues[index] || ''}
                      onChange={(e) => {
                        setCustomValues({ ...customValues, [index]: e.target.value });
                        if (resolution?.resolution === 'custom') {
                          handleResolution(index, 'custom', e.target.value);
                        }
                      }}
                      onFocus={() => {
                        if (resolution?.resolution !== 'custom') {
                          handleResolution(index, 'custom', customValues[index] || '');
                        }
                      }}
                      placeholder="Enter your custom resolution..."
                      rows={3}
                      className="w-full px-3 py-2 rounded text-sm font-mono resize-none"
                      style={{
                        background: currentTheme.colors.background,
                        borderColor: currentTheme.colors.border,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: currentTheme.colors.text.primary,
                      }}
                      data-testid={`conflict-${index}-custom-input`}
                    />
                  </div>
                </div>
              </div>
            </ThemedCard>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <ThemedButton variant="ghost" onClick={onCancel} data-testid="cancel-merge-btn">
          <X className="w-4 h-4" />
          Cancel
        </ThemedButton>
        <ThemedButton
          variant="primary"
          onClick={() => onResolve(resolutions)}
          disabled={!allResolved}
          leftIcon={<GitMerge className="w-4 h-4" />}
          data-testid="resolve-conflicts-btn"
        >
          Resolve & Continue ({resolutions.length}/{conflicts.length})
        </ThemedButton>
      </div>
    </div>
  );
}

interface ConflictOptionProps {
  title: string;
  content: string;
  isSelected: boolean;
  onSelect: () => void;
  testId?: string;
}

function ConflictOption({ title, content, isSelected, onSelect, testId }: ConflictOptionProps) {
  const { currentTheme } = useTheme();

  return (
    <div
      onClick={onSelect}
      className="rounded-lg p-3 cursor-pointer transition-all"
      style={{
        background: isSelected
          ? `${currentTheme.colors.primary}10`
          : `${currentTheme.colors.surface}40`,
        borderColor: isSelected ? currentTheme.colors.primary : currentTheme.colors.border,
        borderWidth: '2px',
        borderStyle: 'solid',
      }}
      data-testid={testId}
    >
      <div className="flex items-center gap-2 mb-2">
        <input
          type="radio"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4"
          data-testid={`${testId}-radio`}
        />
        <span
          className="text-sm font-medium"
          style={{ color: currentTheme.colors.text.primary }}
        >
          {title}
        </span>
      </div>
      <pre
        className="text-xs font-mono whitespace-pre-wrap break-all p-2 rounded"
        style={{
          background: currentTheme.colors.background,
          color: currentTheme.colors.text.secondary,
        }}
      >
        {content}
      </pre>
    </div>
  );
}
