/**
 * Adaptive Prompt Selection Algorithm
 *
 * Selects next prompt based on user performance, difficulty progression,
 * and optimal learning zone targeting.
 */

import {
  calculateDifficultyScore,
  estimateCompletionTime,
  DifficultyLevel,
  PromptDifficulty,
  scoreToLevel
} from './difficultyScoring';
import {
  UserPerformanceStats,
  isInOptimalZone,
  getPerformanceTrend
} from './performanceTracking';

export interface PromptSelectionOptions {
  targetDifficulty?: number;       // 1-10: Target difficulty (overrides adaptive)
  category?: string;               // Filter by category
  excludeCompleted?: boolean;      // Exclude previously completed prompts
  favorWeaknesses?: boolean;       // Focus on weak categories
  maxDifficultyJump?: number;      // Max difficulty increase (default: 1.5)
}

export interface SelectionResult {
  prompt: PromptDifficulty;
  reason: string;
  confidence: number;              // 0-1: Confidence in selection
}

/**
 * Select next prompt based on user performance and difficulty
 */
export function selectNextPrompt(
  availablePrompts: PromptDifficulty[],
  userStats: UserPerformanceStats,
  completedPromptIds: Set<string>,
  options: PromptSelectionOptions = {}
): SelectionResult | null {
  if (availablePrompts.length === 0) {
    return null;
  }

  // Filter prompts based on options
  let candidates = filterPrompts(
    availablePrompts,
    completedPromptIds,
    options
  );

  if (candidates.length === 0) {
    // If all prompts in category completed, allow repeating
    candidates = filterPrompts(
      availablePrompts,
      new Set(),
      { ...options, excludeCompleted: false }
    );
  }

  if (candidates.length === 0) {
    return null;
  }

  // Determine target difficulty
  const targetDifficulty = options.targetDifficulty || userStats.currentDifficulty;

  // Score each candidate
  const scoredPrompts = candidates.map(prompt => ({
    prompt,
    score: scorePromptCandidate(prompt, targetDifficulty, userStats, options),
  }));

  // Sort by score (highest first)
  scoredPrompts.sort((a, b) => b.score - a.score);

  // Select top candidate with some randomness for variety
  const selectedIndex = selectWithVariety(scoredPrompts.map(s => s.score));
  const selected = scoredPrompts[selectedIndex];

  const reason = generateSelectionReason(
    selected.prompt,
    targetDifficulty,
    userStats,
    options
  );

  return {
    prompt: selected.prompt,
    reason,
    confidence: selected.score / 100,
  };
}

/**
 * Filter prompts based on selection options
 */
function filterPrompts(
  prompts: PromptDifficulty[],
  completedIds: Set<string>,
  options: PromptSelectionOptions
): PromptDifficulty[] {
  return prompts.filter(prompt => {
    // Exclude completed if requested
    if (options.excludeCompleted && completedIds.has(prompt.promptId)) {
      return false;
    }

    // Filter by category
    if (options.category && prompt.category !== options.category) {
      return false;
    }

    return true;
  });
}

/**
 * Score a prompt candidate based on user performance and preferences
 */
function scorePromptCandidate(
  prompt: PromptDifficulty,
  targetDifficulty: number,
  userStats: UserPerformanceStats,
  options: PromptSelectionOptions
): number {
  let score = 50; // Base score

  // Score based on difficulty match
  const difficultyDiff = Math.abs(prompt.difficulty.overall - targetDifficulty);
  const maxJump = options.maxDifficultyJump || 1.5;

  if (difficultyDiff <= 0.5) {
    score += 30; // Perfect match
  } else if (difficultyDiff <= 1.0) {
    score += 20; // Good match
  } else if (difficultyDiff <= maxJump) {
    score += 10; // Acceptable
  } else {
    score -= 20; // Too far from target
  }

  // Favor weaknesses if requested
  if (options.favorWeaknesses && userStats.weaknesses.includes(prompt.category)) {
    score += 15;
  }

  // Bonus for strengths if performing well
  if (userStats.averageAccuracy > 0.80 && userStats.strengths.includes(prompt.category)) {
    score += 5;
  }

  // Consider performance trend
  const trend = getPerformanceTrend(userStats.performanceHistory);
  if (trend === 'improving' && prompt.difficulty.overall > targetDifficulty) {
    score += 10; // Challenge improving users
  } else if (trend === 'declining' && prompt.difficulty.overall < targetDifficulty) {
    score += 10; // Support declining users
  }

  // Reward high-quality prompts (high confidence score)
  score += prompt.difficulty.confidence / 10;

  // Slight penalty for very long prompts if user is struggling
  if (userStats.averageAccuracy < 0.60 && prompt.estimatedTime > 120) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Select index with weighted randomness for variety
 */
function selectWithVariety(scores: number[]): number {
  if (scores.length === 0) return 0;
  if (scores.length === 1) return 0;

  // 70% chance to select best, 20% for second, 10% for third
  const rand = Math.random();

  if (rand < 0.7 || scores.length < 2) return 0;
  if (rand < 0.9 || scores.length < 3) return 1;
  return 2;
}

/**
 * Generate human-readable reason for selection
 */
function generateSelectionReason(
  prompt: PromptDifficulty,
  targetDifficulty: number,
  userStats: UserPerformanceStats,
  options: PromptSelectionOptions
): string {
  const reasons: string[] = [];

  // Difficulty reasoning
  const diffDelta = prompt.difficulty.overall - targetDifficulty;
  if (Math.abs(diffDelta) <= 0.5) {
    reasons.push('Matches your current skill level');
  } else if (diffDelta > 0) {
    reasons.push('Slightly challenging to help you improve');
  } else {
    reasons.push('Building confidence with manageable difficulty');
  }

  // Category reasoning
  if (options.favorWeaknesses && userStats.weaknesses.includes(prompt.category)) {
    reasons.push(`Practicing ${prompt.category} to strengthen skills`);
  }

  // Trend reasoning
  const trend = getPerformanceTrend(userStats.performanceHistory);
  if (trend === 'improving') {
    reasons.push('Building on your recent progress');
  } else if (trend === 'declining') {
    reasons.push('Focusing on fundamentals');
  }

  return reasons[0] || 'Selected for optimal learning';
}

/**
 * Helper to collect prompts for a specific difficulty target
 */
function collectPrompts(
  availablePrompts: PromptDifficulty[],
  userStats: UserPerformanceStats,
  completedPromptIds: Set<string>,
  options: PromptSelectionOptions,
  count: number,
  excludeFrom: SelectionResult[][] = []
): SelectionResult[] {
  const results: SelectionResult[] = [];
  const excludedIds = new Set(
    excludeFrom.flatMap(arr => arr.map(r => r.prompt.promptId))
  );

  for (let i = 0; i < count; i++) {
    const result = selectNextPrompt(
      availablePrompts,
      userStats,
      completedPromptIds,
      options
    );

    if (result && !excludedIds.has(result.prompt.promptId)) {
      results.push(result);
      excludedIds.add(result.prompt.promptId);
    }
  }

  return results;
}

/**
 * Get recommended prompts for different learning paths
 */
export function getRecommendedPrompts(
  availablePrompts: PromptDifficulty[],
  userStats: UserPerformanceStats,
  completedPromptIds: Set<string>,
  count: number = 3
): {
  optimal: SelectionResult[],
  challenging: SelectionResult[],
  review: SelectionResult[]
} {
  const currentDiff = userStats.currentDifficulty;

  // Optimal: Match current difficulty
  const optimal = collectPrompts(
    availablePrompts,
    userStats,
    completedPromptIds,
    { targetDifficulty: currentDiff, excludeCompleted: true },
    count
  );

  // Challenging: +1 to +2 difficulty
  const challenging = collectPrompts(
    availablePrompts,
    userStats,
    completedPromptIds,
    { targetDifficulty: Math.min(10, currentDiff + 1.5), excludeCompleted: true },
    count,
    [optimal]
  );

  // Review: -1 to -2 difficulty (from strengths)
  const review = collectPrompts(
    availablePrompts,
    userStats,
    completedPromptIds,
    { targetDifficulty: Math.max(1, currentDiff - 1.5), excludeCompleted: false },
    count,
    [optimal, challenging]
  );

  return { optimal, challenging, review };
}

/**
 * Prepare prompts with difficulty scores
 */
export function preparePromptsWithDifficulty(
  promptTexts: { id: string, text: string, category: string }[]
): PromptDifficulty[] {
  return promptTexts.map(p => {
    const difficulty = calculateDifficultyScore(p.text, p.category);
    const stepCount = countSteps(p.text);
    const estimatedTime = estimateCompletionTime(difficulty, stepCount);

    return {
      promptId: p.id,
      promptText: p.text,
      category: p.category,
      difficulty,
      tags: extractTags(p.text, p.category),
      estimatedTime,
    };
  });
}

/**
 * Count steps in prompt text
 */
function countSteps(text: string): number {
  const patterns = [
    /(\d+)[.)\s]+/g,
    /[-*•]\s+/g,
  ];

  let maxCount = 0;
  for (const pattern of patterns) {
    const matches = (text.match(pattern) || []).length;
    maxCount = Math.max(maxCount, matches);
  }

  return maxCount || 1;
}

/**
 * Extract tags from prompt
 */
function extractTags(text: string, category: string): string[] {
  const tags: string[] = [category.toLowerCase()];

  const tagKeywords = [
    'mobile', 'desktop', 'responsive', 'form', 'navigation',
    'auth', 'login', 'cart', 'checkout', 'search', 'filter',
    'modal', 'popup', 'accessibility', 'visual', 'api'
  ];

  const lowerText = text.toLowerCase();
  tagKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      tags.push(keyword);
    }
  });

  return [...new Set(tags)];
}
