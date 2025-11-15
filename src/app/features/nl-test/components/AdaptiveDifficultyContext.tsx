'use client';

/**
 * Adaptive Difficulty Context
 *
 * React Context for managing user performance statistics and adaptive difficulty
 * across the NL test application.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserPerformanceStats,
  PerformanceMetrics,
  createDefaultPerformanceStats,
  updatePerformanceStats,
  analyzeCategoryPerformance,
  calculatePerformanceMetrics,
} from '../lib/performanceTracking';
import { PromptDifficulty } from '../lib/difficultyScoring';
import {
  selectNextPrompt,
  getRecommendedPrompts,
  SelectionResult,
  PromptSelectionOptions,
} from '../lib/adaptivePromptSelector';

interface AdaptiveDifficultyContextValue {
  // User performance
  userStats: UserPerformanceStats;
  completedPromptIds: Set<string>;
  promptCategoryMap: Map<string, string>;

  // Methods
  recordPerformance: (metrics: PerformanceMetrics) => void;
  getNextPrompt: (
    availablePrompts: PromptDifficulty[],
    options?: PromptSelectionOptions
  ) => SelectionResult | null;
  getRecommendations: (
    availablePrompts: PromptDifficulty[]
  ) => {
    optimal: SelectionResult[];
    challenging: SelectionResult[];
    review: SelectionResult[];
  };
  resetStats: () => void;
  startPrompt: (promptId: string) => void;
  completePrompt: (
    promptId: string,
    success: boolean,
    errors?: string[],
    hintsUsed?: number
  ) => void;

  // Active session
  activePrompt: {
    promptId: string;
    startTime: number;
    estimatedDuration: number;
  } | null;
}

const AdaptiveDifficultyContext = createContext<AdaptiveDifficultyContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'nl-test-performance-stats';
const COMPLETED_KEY = 'nl-test-completed-prompts';

interface AdaptiveDifficultyProviderProps {
  children: ReactNode;
}

export function AdaptiveDifficultyProvider({ children }: AdaptiveDifficultyProviderProps) {
  const [userStats, setUserStats] = useState<UserPerformanceStats>(
    createDefaultPerformanceStats()
  );
  const [completedPromptIds, setCompletedPromptIds] = useState<Set<string>>(new Set());
  const [promptCategoryMap] = useState<Map<string, string>>(new Map());
  const [activePrompt, setActivePrompt] = useState<{
    promptId: string;
    startTime: number;
    estimatedDuration: number;
  } | null>(null);

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem(STORAGE_KEY);
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setUserStats({
          ...parsed,
          recentPerformance: parsed.recentPerformance || [],
          performanceHistory: parsed.performanceHistory || [],
        });
      }

      const savedCompleted = localStorage.getItem(COMPLETED_KEY);
      if (savedCompleted) {
        setCompletedPromptIds(new Set(JSON.parse(savedCompleted)));
      }
    } catch (error) {
      console.error('Error loading performance stats:', error);
    }
  }, []);

  // Save stats to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userStats));
    } catch (error) {
      console.error('Error saving performance stats:', error);
    }
  }, [userStats]);

  useEffect(() => {
    try {
      localStorage.setItem(
        COMPLETED_KEY,
        JSON.stringify(Array.from(completedPromptIds))
      );
    } catch (error) {
      console.error('Error saving completed prompts:', error);
    }
  }, [completedPromptIds]);

  const recordPerformance = (metrics: PerformanceMetrics) => {
    setUserStats(prevStats => {
      const updated = updatePerformanceStats(prevStats, metrics);

      // Update strengths and weaknesses
      const { strengths, weaknesses } = analyzeCategoryPerformance(
        updated.recentPerformance,
        promptCategoryMap
      );
      updated.strengths = strengths;
      updated.weaknesses = weaknesses;

      return updated;
    });

    if (metrics.completed) {
      setCompletedPromptIds(prev => new Set([...prev, metrics.promptId]));
    }
  };

  const getNextPrompt = (
    availablePrompts: PromptDifficulty[],
    options?: PromptSelectionOptions
  ): SelectionResult | null => {
    return selectNextPrompt(availablePrompts, userStats, completedPromptIds, options);
  };

  const getRecommendations = (availablePrompts: PromptDifficulty[]) => {
    return getRecommendedPrompts(availablePrompts, userStats, completedPromptIds);
  };

  const resetStats = () => {
    setUserStats(createDefaultPerformanceStats());
    setCompletedPromptIds(new Set());
    setActivePrompt(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COMPLETED_KEY);
  };

  const startPrompt = (promptId: string, estimatedDuration: number = 60) => {
    setActivePrompt({
      promptId,
      startTime: Date.now(),
      estimatedDuration,
    });
  };

  const completePrompt = (
    promptId: string,
    success: boolean,
    errors: string[] = [],
    hintsUsed: number = 0
  ) => {
    if (!activePrompt || activePrompt.promptId !== promptId) {
      console.warn('Completing prompt that was not started:', promptId);
      return;
    }

    const metrics = calculatePerformanceMetrics(
      promptId,
      activePrompt.startTime,
      Date.now(),
      activePrompt.estimatedDuration,
      'medium', // Will be updated with actual difficulty
      5, // Will be updated with actual difficulty score
      success,
      errors,
      hintsUsed
    );

    recordPerformance(metrics);
    setActivePrompt(null);
  };

  const value: AdaptiveDifficultyContextValue = {
    userStats,
    completedPromptIds,
    promptCategoryMap,
    recordPerformance,
    getNextPrompt,
    getRecommendations,
    resetStats,
    startPrompt,
    completePrompt,
    activePrompt,
  };

  return (
    <AdaptiveDifficultyContext.Provider value={value}>
      {children}
    </AdaptiveDifficultyContext.Provider>
  );
}

export function useAdaptiveDifficulty() {
  const context = useContext(AdaptiveDifficultyContext);
  if (!context) {
    throw new Error(
      'useAdaptiveDifficulty must be used within AdaptiveDifficultyProvider'
    );
  }
  return context;
}
