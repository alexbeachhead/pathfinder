/**
 * AI-Adaptive Prompt Difficulty Scoring System
 *
 * This module implements a difficulty scoring algorithm that evaluates prompts
 * based on complexity metrics and adjusts difficulty dynamically based on user performance.
 */

export interface DifficultyMetrics {
  complexity: number;        // 1-10: Based on number of steps and actions
  specificity: number;        // 1-10: How detailed the prompt is
  technicalDepth: number;     // 1-10: Technical knowledge required
  ambiguity: number;          // 1-10: Level of ambiguity (higher = more ambiguous)
}

export interface DifficultyScore {
  overall: number;            // 1-10: Weighted average of metrics
  level: DifficultyLevel;     // Easy, Medium, Hard, Expert
  metrics: DifficultyMetrics;
  confidence: number;         // 0-100: Confidence in scoring
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface PromptDifficulty {
  promptId: string;
  promptText: string;
  category: string;
  difficulty: DifficultyScore;
  tags: string[];
  estimatedTime: number;      // Estimated completion time in seconds
}

/**
 * Calculate difficulty score for a prompt
 */
export function calculateDifficultyScore(
  promptText: string,
  category: string,
  stepCount?: number
): DifficultyScore {
  const metrics = analyzeDifficultyMetrics(promptText, category, stepCount);
  const overall = calculateOverallScore(metrics);
  const level = scoreToLevel(overall);
  const confidence = calculateConfidence(promptText, metrics);

  return {
    overall,
    level,
    metrics,
    confidence,
  };
}

/**
 * Analyze individual difficulty metrics
 */
function analyzeDifficultyMetrics(
  promptText: string,
  category: string,
  stepCount?: number
): DifficultyMetrics {
  const text = promptText.toLowerCase();
  const words = promptText.split(/\s+/).length;
  const steps = stepCount || countSteps(promptText);

  // Complexity: Based on step count, word count, and action diversity
  const actionKeywords = [
    'navigate', 'click', 'type', 'verify', 'assert', 'wait',
    'hover', 'select', 'scroll', 'drag', 'upload', 'download'
  ];
  const uniqueActions = actionKeywords.filter(kw => text.includes(kw)).length;
  const complexity = Math.min(10, Math.round(
    (steps * 1.5) + (uniqueActions * 0.8) + (words / 15)
  ));

  // Specificity: How detailed the prompt is
  const hasQuotes = (promptText.match(/["']/g) || []).length;
  const hasSelectors = /button|link|input|form|element|class|id/i.test(text);
  const hasAssertions = /verify|check|assert|expect|should/i.test(text);
  const specificity = Math.min(10, Math.round(
    (hasQuotes / 2) + (hasSelectors ? 3 : 0) + (hasAssertions ? 2 : 0) + (steps > 0 ? 2 : 0)
  ));

  // Technical Depth: Required technical knowledge
  const technicalTerms = [
    'api', 'ajax', 'websocket', 'localStorage', 'cookie', 'auth',
    'oauth', 'jwt', 'session', 'cache', 'redirect', 'cors'
  ];
  const categoryDepth = getCategoryTechnicalDepth(category);
  const termCount = technicalTerms.filter(term => text.includes(term)).length;
  const technicalDepth = Math.min(10, categoryDepth + termCount);

  // Ambiguity: Level of unclear or vague language
  const ambiguousTerms = ['it', 'that', 'thing', 'something', 'stuff', 'etc'];
  const ambiguousCount = ambiguousTerms.filter(term =>
    new RegExp(`\\b${term}\\b`, 'i').test(text)
  ).length;
  const lackOfDetail = steps === 0 || words < 20;
  const ambiguity = Math.min(10, Math.round(
    (ambiguousCount * 2) + (lackOfDetail ? 4 : 0)
  ));

  return {
    complexity: Math.max(1, complexity),
    specificity: Math.max(1, specificity),
    technicalDepth: Math.max(1, technicalDepth),
    ambiguity: Math.max(1, ambiguity),
  };
}

/**
 * Calculate overall difficulty score (weighted average)
 */
function calculateOverallScore(metrics: DifficultyMetrics): number {
  const weights = {
    complexity: 0.35,
    specificity: 0.20,
    technicalDepth: 0.30,
    ambiguity: 0.15,
  };

  // High ambiguity reduces specificity
  const adjustedSpecificity = Math.max(1, metrics.specificity - (metrics.ambiguity / 2));

  const weighted =
    (metrics.complexity * weights.complexity) +
    (adjustedSpecificity * weights.specificity) +
    (metrics.technicalDepth * weights.technicalDepth) +
    (metrics.ambiguity * weights.ambiguity);

  return Math.max(1, Math.min(10, Math.round(weighted * 10) / 10));
}

/**
 * Convert numeric score to difficulty level
 */
export function scoreToLevel(score: number): DifficultyLevel {
  if (score <= 3) return 'easy';
  if (score <= 6) return 'medium';
  if (score <= 8.5) return 'hard';
  return 'expert';
}

/**
 * Calculate confidence in the scoring
 */
function calculateConfidence(promptText: string, metrics: DifficultyMetrics): number {
  let confidence = 70; // Base confidence

  // More steps = more confidence
  const steps = countSteps(promptText);
  if (steps > 0) confidence += Math.min(15, steps * 3);

  // Clear structure increases confidence
  if (metrics.specificity > 5) confidence += 10;

  // High ambiguity reduces confidence
  confidence -= metrics.ambiguity * 2;

  return Math.max(0, Math.min(100, confidence));
}

/**
 * Count steps in a prompt
 */
function countSteps(text: string): number {
  const patterns = [
    /(\d+)[.)\s]+/g,     // Numbered steps
    /[-*•]\s+/g,         // Bullet points
  ];

  let maxCount = 0;
  for (const pattern of patterns) {
    const matches = (text.match(pattern) || []).length;
    maxCount = Math.max(maxCount, matches);
  }

  return maxCount;
}

/**
 * Get technical depth based on category
 */
function getCategoryTechnicalDepth(category: string): number {
  const categoryDepths: Record<string, number> = {
    'Navigation': 2,
    'Forms': 3,
    'E-commerce': 5,
    'User Authentication': 6,
    'Visual Checks': 2,
    'Search & Filtering': 4,
    'Modal & Popups': 3,
    'Accessibility': 7,
    'API Testing': 8,
    'Performance': 8,
  };

  return categoryDepths[category] || 4;
}

/**
 * Estimate completion time based on difficulty
 */
export function estimateCompletionTime(difficulty: DifficultyScore, stepCount: number): number {
  const baseTime = 30; // 30 seconds base
  const timePerStep = 15; // 15 seconds per step
  const difficultyMultiplier = difficulty.overall / 5; // 0.2 to 2.0

  const estimated = baseTime + (stepCount * timePerStep * difficultyMultiplier);
  return Math.round(estimated);
}

/**
 * Adjust difficulty score based on user performance
 */
export function adjustDifficultyBasedOnPerformance(
  currentDifficulty: number,
  accuracy: number,
  timeRatio: number
): number {
  let adjustment = 0;

  // If user is performing well, increase difficulty
  if (accuracy >= 0.85 && timeRatio <= 1.2) {
    adjustment = 0.5;
  } else if (accuracy >= 0.70 && timeRatio <= 1.5) {
    adjustment = 0.2;
  }
  // If user is struggling, decrease difficulty
  else if (accuracy < 0.50 || timeRatio > 2.0) {
    adjustment = -0.5;
  } else if (accuracy < 0.65 || timeRatio > 1.8) {
    adjustment = -0.2;
  }

  return Math.max(1, Math.min(10, currentDifficulty + adjustment));
}

/**
 * Difficulty level configuration
 */
const DIFFICULTY_CONFIG: Record<DifficultyLevel, { color: string; label: string }> = {
  easy: { color: '#10b981', label: 'Easy' },
  medium: { color: '#f59e0b', label: 'Medium' },
  hard: { color: '#ef4444', label: 'Hard' },
  expert: { color: '#8b5cf6', label: 'Expert' },
};

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(level: DifficultyLevel): string {
  return DIFFICULTY_CONFIG[level].color;
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(level: DifficultyLevel): string {
  return DIFFICULTY_CONFIG[level].label;
}
