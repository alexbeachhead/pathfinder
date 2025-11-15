'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { DifficultyLevel, getDifficultyColor, getDifficultyLabel } from '../lib/difficultyScoring';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  score?: number;
  showScore?: boolean;
  className?: string;
}

export function DifficultyBadge({ level, score, showScore = false, className = '' }: DifficultyBadgeProps) {
  const color = getDifficultyColor(level);
  const label = getDifficultyLabel(level);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} data-testid="difficulty-badge">
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
        style={{
          backgroundColor: `${color}20`,
          color: color,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: `${color}40`,
        }}
      >
        <DifficultyIcon level={level} color={color} />
        <span>{label}</span>
        {showScore && score && (
          <span className="ml-1 opacity-70">({score.toFixed(1)})</span>
        )}
      </div>
    </div>
  );
}

function DifficultyIcon({ level, color }: { level: DifficultyLevel, color: string }) {
  const icons = {
    easy: '●',
    medium: '●●',
    hard: '●●●',
    expert: '◆◆◆',
  };

  return (
    <span style={{ color, fontSize: '10px', lineHeight: 1 }}>
      {icons[level]}
    </span>
  );
}
