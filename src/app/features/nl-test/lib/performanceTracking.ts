/**
 * Performance Tracking for Adaptive Difficulty
 *
 * Tracks user performance metrics including accuracy, completion time,
 * and difficulty progression to enable adaptive prompt selection.
 */

import { DifficultyLevel } from './difficultyScoring';

export interface PerformanceMetrics {
  promptId: string;
  startTime: number;
  endTime?: number;
  duration?: number;              // Actual time taken in seconds
  estimatedDuration: number;       // Expected time
  accuracy: number;                // 0-1: Success rate
  difficulty: DifficultyLevel;
  difficultyScore: number;         // 1-10
  completed: boolean;
  errors: string[];
  hints_used: number;
}

export interface UserPerformanceStats {
  totalAttempts: number;
  completedAttempts: number;
  averageAccuracy: number;         // 0-1
  averageTimeRatio: number;        // actual/estimated
  currentDifficulty: number;       // 1-10: Current adaptive difficulty
  difficultyTrend: number;         // -1 to 1: Direction of difficulty change
  strengths: string[];             // Categories where user excels
  weaknesses: string[];            // Categories needing improvement
  recentPerformance: PerformanceMetrics[];
  performanceHistory: PerformanceSnapshot[];
}

export interface PerformanceSnapshot {
  timestamp: number;
  difficulty: number;
  accuracy: number;
  timeRatio: number;
}

export interface PerformanceThresholds {
  excellent: number;               // Accuracy threshold for increasing difficulty
  good: number;                    // Maintain current difficulty
  struggling: number;              // Decrease difficulty
  maxTimeRatio: number;            // Time ratio indicating struggle
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  excellent: 0.85,
  good: 0.70,
  struggling: 0.50,
  maxTimeRatio: 2.0,
};

const PERFORMANCE_WINDOW = 5;  // Consider last 5 attempts for stats

/**
 * Calculate performance metrics for a completed prompt
 */
export function calculatePerformanceMetrics(
  promptId: string,
  startTime: number,
  endTime: number,
  estimatedDuration: number,
  difficulty: DifficultyLevel,
  difficultyScore: number,
  success: boolean,
  errors: string[] = [],
  hintsUsed: number = 0
): PerformanceMetrics {
  const duration = Math.round((endTime - startTime) / 1000); // Convert to seconds
  const accuracy = success ? (1 - (errors.length * 0.1) - (hintsUsed * 0.05)) : 0;

  return {
    promptId,
    startTime,
    endTime,
    duration,
    estimatedDuration,
    accuracy: Math.max(0, Math.min(1, accuracy)),
    difficulty,
    difficultyScore,
    completed: success,
    errors,
    hints_used: hintsUsed,
  };
}

/**
 * Update user performance statistics
 */
export function updatePerformanceStats(
  currentStats: UserPerformanceStats,
  newMetrics: PerformanceMetrics
): UserPerformanceStats {
  const recentPerformance = [
    newMetrics,
    ...currentStats.recentPerformance.slice(0, PERFORMANCE_WINDOW - 1)
  ];

  const totalAttempts = currentStats.totalAttempts + 1;
  const completedAttempts = currentStats.completedAttempts + (newMetrics.completed ? 1 : 0);

  // Calculate running averages from recent performance
  const avgAccuracy = calculateAverageAccuracy(recentPerformance);
  const avgTimeRatio = calculateAverageTimeRatio(recentPerformance);

  // Determine new difficulty based on performance
  const newDifficulty = determineNextDifficulty(
    currentStats.currentDifficulty,
    avgAccuracy,
    avgTimeRatio
  );

  const difficultyTrend = newDifficulty - currentStats.currentDifficulty;

  // Create performance snapshot
  const snapshot: PerformanceSnapshot = {
    timestamp: newMetrics.endTime || Date.now(),
    difficulty: newMetrics.difficultyScore,
    accuracy: newMetrics.accuracy,
    timeRatio: newMetrics.duration! / newMetrics.estimatedDuration,
  };

  const performanceHistory = [
    snapshot,
    ...currentStats.performanceHistory.slice(0, 19) // Keep last 20
  ];

  return {
    totalAttempts,
    completedAttempts,
    averageAccuracy: avgAccuracy,
    averageTimeRatio: avgTimeRatio,
    currentDifficulty: newDifficulty,
    difficultyTrend,
    strengths: currentStats.strengths, // Updated separately
    weaknesses: currentStats.weaknesses, // Updated separately
    recentPerformance,
    performanceHistory,
  };
}

/**
 * Calculate average accuracy from recent performance
 */
function calculateAverageAccuracy(metrics: PerformanceMetrics[]): number {
  if (metrics.length === 0) return 0;

  const sum = metrics.reduce((acc, m) => acc + m.accuracy, 0);
  return sum / metrics.length;
}

/**
 * Calculate average time ratio (actual/estimated)
 */
function calculateAverageTimeRatio(metrics: PerformanceMetrics[]): number {
  if (metrics.length === 0) return 1;

  const completed = metrics.filter(m => m.completed && m.duration);
  if (completed.length === 0) return 1;

  const sum = completed.reduce((acc, m) => {
    const ratio = m.duration! / m.estimatedDuration;
    return acc + ratio;
  }, 0);

  return sum / completed.length;
}

/**
 * Determine next difficulty level based on performance
 */
function determineNextDifficulty(
  currentDifficulty: number,
  accuracy: number,
  timeRatio: number,
  thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS
): number {
  let newDifficulty = currentDifficulty;

  // Excellent performance: increase difficulty
  if (accuracy >= thresholds.excellent && timeRatio <= 1.2) {
    newDifficulty += 0.5;
  }
  // Good performance: slight increase
  else if (accuracy >= thresholds.good && timeRatio <= 1.5) {
    newDifficulty += 0.2;
  }
  // Struggling: decrease difficulty
  else if (accuracy < thresholds.struggling || timeRatio > thresholds.maxTimeRatio) {
    newDifficulty -= 0.5;
  }
  // Below good: slight decrease
  else if (accuracy < thresholds.good || timeRatio > 1.8) {
    newDifficulty -= 0.2;
  }

  // Keep difficulty in valid range
  return Math.max(1, Math.min(10, newDifficulty));
}

/**
 * Initialize default performance stats for new user
 */
export function createDefaultPerformanceStats(): UserPerformanceStats {
  return {
    totalAttempts: 0,
    completedAttempts: 0,
    averageAccuracy: 0,
    averageTimeRatio: 1,
    currentDifficulty: 4, // Start at medium difficulty
    difficultyTrend: 0,
    strengths: [],
    weaknesses: [],
    recentPerformance: [],
    performanceHistory: [],
  };
}

/**
 * Analyze category performance to identify strengths and weaknesses
 */
export function analyzeCategoryPerformance(
  metrics: PerformanceMetrics[],
  categories: Map<string, string> // promptId -> category
): { strengths: string[], weaknesses: string[] } {
  const categoryStats = new Map<string, { total: number, accuracy: number }>();

  // Group by category
  metrics.forEach(m => {
    const category = categories.get(m.promptId);
    if (!category) return;

    const stats = categoryStats.get(category) || { total: 0, accuracy: 0 };
    stats.total += 1;
    stats.accuracy += m.accuracy;
    categoryStats.set(category, stats);
  });

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Analyze each category
  categoryStats.forEach((stats, category) => {
    if (stats.total < 2) return; // Need at least 2 attempts

    const avgAccuracy = stats.accuracy / stats.total;

    if (avgAccuracy >= 0.80) {
      strengths.push(category);
    } else if (avgAccuracy < 0.60) {
      weaknesses.push(category);
    }
  });

  return { strengths, weaknesses };
}

/**
 * Get performance trend (improving, stable, declining)
 */
export function getPerformanceTrend(
  history: PerformanceSnapshot[],
  windowSize: number = 5
): 'improving' | 'stable' | 'declining' {
  if (history.length < windowSize) return 'stable';

  const recent = history.slice(0, windowSize);
  const older = history.slice(windowSize, windowSize * 2);

  if (older.length < windowSize) return 'stable';

  const recentAvg = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + s.accuracy, 0) / older.length;

  const difference = recentAvg - olderAvg;

  if (difference > 0.10) return 'improving';
  if (difference < -0.10) return 'declining';
  return 'stable';
}

/**
 * Check if user is in optimal learning zone (flow state)
 */
export function isInOptimalZone(
  accuracy: number,
  timeRatio: number
): boolean {
  // Optimal zone: 70-85% accuracy, 1.0-1.5x estimated time
  return accuracy >= 0.70 && accuracy <= 0.85 && timeRatio >= 1.0 && timeRatio <= 1.5;
}

/**
 * Get recommended difficulty adjustment
 */
export function getRecommendedAdjustment(
  stats: UserPerformanceStats
): { adjustment: number, reason: string } {
  const { averageAccuracy, averageTimeRatio, currentDifficulty } = stats;

  if (averageAccuracy >= 0.85 && averageTimeRatio <= 1.2) {
    return {
      adjustment: 0.5,
      reason: 'Excellent performance - increasing challenge'
    };
  }

  if (averageAccuracy < 0.50 || averageTimeRatio > 2.0) {
    return {
      adjustment: -0.5,
      reason: 'Struggling - reducing difficulty'
    };
  }

  if (isInOptimalZone(averageAccuracy, averageTimeRatio)) {
    return {
      adjustment: 0,
      reason: 'Perfect learning zone - maintaining difficulty'
    };
  }

  return {
    adjustment: 0,
    reason: 'Stable performance'
  };
}
