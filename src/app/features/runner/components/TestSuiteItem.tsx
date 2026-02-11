'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Trash2, Pencil } from 'lucide-react';
import { TestSuite } from '@/lib/types';
import { Theme } from '@/lib/theme';

interface TestSuiteItemProps {
  suite: TestSuite & { scenarioCount?: number };
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (suiteId: string) => void | Promise<void>;
  onSuiteUpdate?: (suiteId: string, updates: { name: string }) => void | Promise<void>;
  theme: Theme;
  index: number;
}

export function TestSuiteItem({ suite, isSelected, onClick, onDelete, onSuiteUpdate, theme, index }: TestSuiteItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(suite.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditName(suite.name);
  }, [suite.name]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the item selection
    window.open(suite.target_url, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    if (!window.confirm(`Delete suite "${suite.name}"? This will remove the suite and all its test runs and code.`)) return;
    setDeleting(true);
    try {
      await onDelete(suite.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSuiteUpdate) return;
    setEditName(suite.name);
    setIsEditing(true);
  };

  const handleCommitEdit = async () => {
    setIsEditing(false);
    if (!onSuiteUpdate || !editName.trim() || editName.trim() === suite.name) return;
    await onSuiteUpdate(suite.id, { name: editName.trim() });
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') handleCommitEdit();
    if (e.key === 'Escape') {
      setEditName(suite.name);
      setIsEditing(false);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg transition-all relative"
      style={{
        backgroundColor: isSelected
          ? `${theme.colors.primary}15`
          : theme.colors.surface,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
      }}
      data-testid={`test-suite-item-${suite.id}`}
    >
      {/* Actions - Top Right Corner */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {onDelete && (
          <motion.button
            onClick={handleDeleteClick}
            disabled={deleting}
            className="p-1.5 rounded-md transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              backgroundColor: '#dc262620',
              color: '#dc2626',
            }}
            aria-label={`Delete ${suite.name}`}
            data-testid={`test-suite-delete-${suite.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        )}
        <motion.button
          onClick={handleExternalLinkClick}
          className="p-1.5 rounded-md transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            backgroundColor: `${theme.colors.primary}20`,
            color: theme.colors.primary,
          }}
          aria-label={`Open ${suite.name} in new tab`}
          data-testid={`test-suite-external-link-${suite.id}`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Suite Name and Selection Indicator */}
      <div className="flex items-start justify-between mb-2 pr-8 gap-2">
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleCommitEdit}
              onKeyDown={handleNameKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-sm flex-1 min-w-0 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.surface,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: theme.colors.border,
              }}
              data-testid={`test-suite-name-input-${suite.id}`}
            />
          ) : (
            <h4 className="font-medium text-sm truncate" style={{ color: theme.colors.text.primary }}>
              {suite.name}
            </h4>
          )}
          {onSuiteUpdate && !isEditing && (
            <motion.button
              type="button"
              onClick={handleStartEdit}
              className="p-1 rounded shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: theme.colors.text.secondary }}
              aria-label="Edit suite name"
              data-testid={`test-suite-edit-${suite.id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
        {isSelected && !isEditing && (
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: theme.colors.primary }}
          />
        )}
      </div>

      {/* Suite Description */}
      {suite.description && (
        <p className="text-xs line-clamp-2 mb-2" style={{ color: theme.colors.text.secondary }}>
          {suite.description}
        </p>
      )}

      {/* Scenario Count Badge */}
      {suite.scenarioCount !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <FileText className="w-3.5 h-3.5" style={{ color: theme.colors.text.tertiary }} />
          <span className="text-xs" style={{ color: theme.colors.text.tertiary }}>
            {suite.scenarioCount} scenario{suite.scenarioCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </motion.button>
  );
}
