'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ListChecks, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { QueueStats } from '@/lib/types';

interface QueueBadgeProps {
  stats: QueueStats;
  concurrencyLimit?: number;
  onClick?: () => void;
  className?: string;
}

export function QueueBadge({ stats, concurrencyLimit, onClick, className = '' }: QueueBadgeProps) {
  const { currentTheme } = useTheme();

  const hasActiveJobs = stats.queued > 0 || stats.running > 0;
  const hasFailedJobs = stats.failed > 0;

  const getBadgeColor = () => {
    if (hasFailedJobs) return '#ef4444'; // Red
    if (stats.running > 0) return currentTheme.colors.primary; // Primary
    if (stats.queued > 0) return '#f59e0b'; // Amber
    return currentTheme.colors.text.tertiary; // Gray
  };

  const badgeColor = getBadgeColor();

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        backgroundColor: `${currentTheme.colors.surface}`,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `${badgeColor}40`,
      }}
      data-testid="queue-badge"
    >
      {/* Icon */}
      <div className="relative">
        {stats.running > 0 ? (
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ color: badgeColor }}
            data-testid="queue-badge-running-icon"
          />
        ) : (
          <ListChecks
            className="w-4 h-4"
            style={{ color: badgeColor }}
            data-testid="queue-badge-icon"
          />
        )}

        {/* Pulse animation for active jobs */}
        {hasActiveJobs && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: badgeColor }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm">
        {/* Running */}
        {stats.running > 0 && (
          <div
            className="flex items-center gap-1"
            title={`${stats.running} running${concurrencyLimit ? ` (limit: ${concurrencyLimit})` : ''}`}
            data-testid="queue-badge-running"
          >
            <Loader2 className="w-3 h-3" style={{ color: currentTheme.colors.primary }} />
            <span style={{ color: currentTheme.colors.text.primary }} className="font-medium">
              {stats.running}
            </span>
          </div>
        )}

        {/* Queued */}
        {stats.queued > 0 && (
          <div
            className="flex items-center gap-1"
            title={`${stats.queued} queued`}
            data-testid="queue-badge-queued"
          >
            <Clock className="w-3 h-3" style={{ color: '#f59e0b' }} />
            <span style={{ color: currentTheme.colors.text.secondary }}>
              {stats.queued}
            </span>
          </div>
        )}

        {/* Failed */}
        {stats.failed > 0 && (
          <div
            className="flex items-center gap-1"
            title={`${stats.failed} failed`}
            data-testid="queue-badge-failed"
          >
            <XCircle className="w-3 h-3" style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>
              {stats.failed}
            </span>
          </div>
        )}

        {/* Completed */}
        {stats.completed > 0 && !hasActiveJobs && (
          <div
            className="flex items-center gap-1"
            title={`${stats.completed} completed`}
            data-testid="queue-badge-completed"
          >
            <CheckCircle2 className="w-3 h-3" style={{ color: '#22c55e' }} />
            <span style={{ color: currentTheme.colors.text.secondary }}>
              {stats.completed}
            </span>
          </div>
        )}

        {/* Idle state */}
        {!hasActiveJobs && stats.total === 0 && (
          <span
            style={{ color: currentTheme.colors.text.tertiary }}
            className="text-xs"
            data-testid="queue-badge-idle"
          >
            No jobs
          </span>
        )}
      </div>

      {/* Total count (subtle) */}
      {stats.total > 0 && (
        <span
          className="text-xs ml-1"
          style={{ color: currentTheme.colors.text.tertiary }}
          title="Total jobs"
        >
          ({stats.total})
        </span>
      )}
    </motion.div>
  );
}
