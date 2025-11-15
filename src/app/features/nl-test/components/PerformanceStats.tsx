'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { UserPerformanceStats, getPerformanceTrend } from '../lib/performanceTracking';
import { scoreToLevel, getDifficultyColor } from '../lib/difficultyScoring';
import { DifficultyBadge } from './DifficultyBadge';

interface PerformanceStatsProps {
  stats: UserPerformanceStats;
  compact?: boolean;
}

export function PerformanceStats({ stats, compact = false }: PerformanceStatsProps) {
  const { currentTheme } = useTheme();
  const trend = getPerformanceTrend(stats.performanceHistory);
  const currentLevel = scoreToLevel(stats.currentDifficulty);

  if (compact) {
    return (
      <div className="flex items-center gap-3" data-testid="performance-stats-compact">
        <DifficultyBadge level={currentLevel} score={stats.currentDifficulty} showScore />

        <div className="flex items-center gap-1.5 text-xs">
          <Activity className="w-3 h-3" style={{ color: currentTheme.colors.primary }} />
          <span style={{ color: currentTheme.colors.text.secondary }}>
            {(stats.averageAccuracy * 100).toFixed(0)}% avg
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {trend === 'improving' && <TrendingUp className="w-3 h-3 text-green-500" />}
          {trend === 'declining' && <TrendingDown className="w-3 h-3 text-red-500" />}
          {trend === 'stable' && <span className="w-3 h-3 text-blue-500">━</span>}
          <span style={{ color: currentTheme.colors.text.secondary }}>
            {stats.completedAttempts} completed
          </span>
        </div>
      </div>
    );
  }

  return (
    <ThemedCard variant="bordered" data-testid="performance-stats-full">
      <ThemedCardHeader
        title="Your Progress"
        subtitle="Performance metrics and difficulty level"
        icon={<Activity className="w-5 h-5" />}
      />
      <ThemedCardContent>
        <div className="space-y-4">
          {/* Current Difficulty */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
              Current Difficulty Level
            </p>
            <DifficultyBadge level={currentLevel} score={stats.currentDifficulty} showScore />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Target className="w-4 h-4" />}
              label="Accuracy"
              value={`${(stats.averageAccuracy * 100).toFixed(0)}%`}
              color={stats.averageAccuracy >= 0.7 ? '#10b981' : '#f59e0b'}
              testId="accuracy-stat"
            />

            <StatCard
              icon={<Award className="w-4 h-4" />}
              label="Completed"
              value={stats.completedAttempts.toString()}
              color={currentTheme.colors.primary}
              testId="completed-stat"
            />
          </div>

          {/* Performance Trend */}
          <div
            className="p-3 rounded flex items-center gap-3"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: currentTheme.colors.border,
            }}
            data-testid="performance-trend"
          >
            {trend === 'improving' && (
              <>
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                    Improving
                  </p>
                  <p className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                    Great progress! Keep it up
                  </p>
                </div>
              </>
            )}
            {trend === 'declining' && (
              <>
                <TrendingDown className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                    Needs Focus
                  </p>
                  <p className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                    Consider reviewing fundamentals
                  </p>
                </div>
              </>
            )}
            {trend === 'stable' && (
              <>
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#3b82f6' }}>
                    Stable
                  </p>
                  <p className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                    Consistent performance
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Strengths & Weaknesses */}
          {(stats.strengths.length > 0 || stats.weaknesses.length > 0) && (
            <div className="space-y-2">
              {stats.strengths.length > 0 && (
                <div data-testid="strengths-section">
                  <p className="text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.text.secondary }}>
                    Strengths
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stats.strengths.map(strength => (
                      <Badge key={strength} variant="success">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {stats.weaknesses.length > 0 && (
                <div data-testid="weaknesses-section">
                  <p className="text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.text.secondary }}>
                    Areas to Improve
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stats.weaknesses.map(weakness => (
                      <Badge key={weakness} variant="warning">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {stats.totalAttempts > 0 && (
            <div data-testid="progress-bar">
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: currentTheme.colors.text.secondary }}>
                  Learning Progress
                </span>
                <span style={{ color: currentTheme.colors.text.secondary }}>
                  {stats.completedAttempts}/{stats.totalAttempts}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: currentTheme.colors.surface }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.completedAttempts / stats.totalAttempts) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                />
              </div>
            </div>
          )}
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  testId: string;
}) {
  const { currentTheme } = useTheme();

  return (
    <div
      className="p-3 rounded"
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: currentTheme.colors.border,
      }}
      data-testid={testId}
    >
      <div className="flex items-center gap-2 mb-1">
        <div style={{ color }}>{icon}</div>
        <span className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
          {label}
        </span>
      </div>
      <p className="text-lg font-bold" style={{ color: currentTheme.colors.text.primary }}>
        {value}
      </p>
    </div>
  );
}
