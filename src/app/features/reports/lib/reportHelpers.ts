/**
 * Report utility functions for reducing code duplication
 * Refactoring Batch 15 - Code quality improvements
 */

/**
 * Get color for priority level
 */
export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#22c55e';
  }
}

/**
 * Get color for cause category
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'code':
      return '#ef4444';
    case 'environment':
      return '#f59e0b';
    case 'data':
      return '#8b5cf6';
    case 'infrastructure':
      return '#06b6d4';
    case 'timeout':
      return '#f97316';
    case 'dependency':
      return '#ec4899';
    default:
      return '#6b7280';
  }
}

/**
 * Format pass rate color based on percentage
 */
export function getPassRateColor(passRate: number): string {
  if (passRate >= 80) return '#22c55e';
  if (passRate >= 50) return '#eab308';
  return '#ef4444';
}

/**
 * Format metric change indicator
 */
export function formatMetricChange(current: number, previous: number): {
  value: number;
  isPositive: boolean;
  displayText: string;
} {
  const change = current - previous;
  const isPositive = change > 0;
  const displayText = `${isPositive ? '+' : ''}${change.toFixed(1)}`;

  return {
    value: change,
    isPositive,
    displayText,
  };
}

/**
 * Calculate similarity percentage display text
 */
export function formatSimilarity(score: number): string {
  return `${Math.round(score * 100)}% similar`;
}

/**
 * Get status color
 */
export function getStatusColor(status: 'pass' | 'fail' | 'pending'): string {
  switch (status) {
    case 'pass':
      return '#22c55e';
    case 'fail':
      return '#ef4444';
    case 'pending':
      return '#f59e0b';
  }
}

/**
 * Create styled background based on status
 */
export function getStatusBackground(status: 'success' | 'error' | 'warning' | 'info'): {
  backgroundColor: string;
  borderColor: string;
} {
  const colors = {
    success: { bg: '#22c55e10', border: '#22c55e30' },
    error: { bg: '#ef444410', border: '#ef444430' },
    warning: { bg: '#f9731610', border: '#f9731630' },
    info: { bg: '#06b6d410', border: '#06b6d430' },
  };

  return {
    backgroundColor: colors[status].bg,
    borderColor: colors[status].border,
  };
}
