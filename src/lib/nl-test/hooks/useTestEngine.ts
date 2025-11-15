'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  generateTest,
  parseIntent,
  buildTemplate,
  getAllExamples,
  getRandomExamples,
  searchExamples,
  getTemplateById,
  getTemplatesByCategory,
  getTemplateCategories,
  EXAMPLE_PROMPTS,
  TEST_TEMPLATES,
  type IntentAnalysis,
  type TestTemplate,
  type ExamplePrompt,
  type ExampleCategory,
} from '../testEngine';

export interface UseTestEngineOptions {
  autoAnalyze?: boolean;
  memoizeExamples?: boolean;
  memoizeTemplates?: boolean;
}

export interface TestEngineState {
  // Analysis state
  analysis: IntentAnalysis | null;
  analyzing: boolean;
  analysisError: string | null;

  // Generation state
  generatedCode: string;
  testName: string;
  generating: boolean;
  generationError: string | null;

  // Data
  examples: ExampleCategory[];
  templates: TestTemplate[];

  // Helper functions
  getAllExamples: () => ExamplePrompt[];
  getRandomExamples: (count?: number) => ExamplePrompt[];
  searchExamples: (query: string) => ExamplePrompt[];
  getTemplateById: (id: string) => TestTemplate | undefined;
  getTemplatesByCategory: (category: string) => TestTemplate[];
  getTemplateCategories: () => string[];
  buildTemplate: (template: TestTemplate, values: Record<string, string>) => string;

  // Actions
  analyze: (description: string, targetUrl?: string) => Promise<void>;
  generate: (description: string, targetUrl: string, viewport?: string) => Promise<void>;
  reset: () => void;
  clearErrors: () => void;
}

/**
 * Centralized hook for all NL test engine functionality
 *
 * This hook provides:
 * - Intent analysis with loading states and automatic caching
 * - Test code generation with loading states and automatic caching
 * - Memoized access to examples and templates
 * - Helper functions for searching and filtering
 * - Consistent error handling
 * - Performance optimization via memoization of expensive operations
 *
 * @param options - Configuration options
 * @returns Test engine state and actions
 */
export function useTestEngine(options: UseTestEngineOptions = {}): TestEngineState {
  const {
    autoAnalyze = false,
    memoizeExamples = true,
    memoizeTemplates = true,
  } = options;

  // Analysis state
  const [analysis, setAnalysis] = useState<IntentAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Generation state
  const [generatedCode, setGeneratedCode] = useState('');
  const [testName, setTestName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Memoized data
  const examples = useMemo(
    () => (memoizeExamples ? EXAMPLE_PROMPTS : EXAMPLE_PROMPTS),
    [memoizeExamples]
  );

  const templates = useMemo(
    () => (memoizeTemplates ? TEST_TEMPLATES : TEST_TEMPLATES),
    [memoizeTemplates]
  );

  // Memoized helper functions
  const memoizedGetAllExamples = useCallback(() => getAllExamples(), []);
  const memoizedGetRandomExamples = useCallback((count?: number) => getRandomExamples(count), []);
  const memoizedSearchExamples = useCallback((query: string) => searchExamples(query), []);
  const memoizedGetTemplateById = useCallback((id: string) => getTemplateById(id), []);
  const memoizedGetTemplatesByCategory = useCallback((category: string) => getTemplatesByCategory(category), []);
  const memoizedGetTemplateCategories = useCallback(() => getTemplateCategories(), []);
  const memoizedBuildTemplate = useCallback(
    (template: TestTemplate, values: Record<string, string>) => buildTemplate(template, values),
    []
  );

  // Memoize intent analysis results based on inputs
  const analysisCache = useMemo(() => new Map<string, IntentAnalysis>(), []);

  // Analyze intent with memoization
  const analyze = useCallback(async (description: string, targetUrl?: string) => {
    if (!description.trim()) {
      setAnalysisError('Please enter a test description');
      return;
    }

    // Create cache key from inputs
    const cacheKey = `${description.trim()}||${targetUrl || ''}`;

    // Check cache first
    const cached = analysisCache.get(cacheKey);
    if (cached) {
      setAnalysis(cached);
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisError(null);
      setAnalysis(null);

      const result = await parseIntent(description, targetUrl);
      setAnalysis(result);

      // Cache the result
      analysisCache.set(cacheKey, result);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setAnalysisError(error.message || 'Failed to analyze intent');
    } finally {
      setAnalyzing(false);
    }
  }, [analysisCache]);

  // Memoize test generation results based on inputs
  const generationCache = useMemo(() => new Map<string, { code: string; testName: string }>(), []);

  // Generate test code with memoization
  const generate = useCallback(async (
    description: string,
    targetUrl: string,
    viewport?: string
  ) => {
    if (!description.trim()) {
      setGenerationError('Please enter a test description');
      return;
    }

    if (!targetUrl.trim()) {
      setGenerationError('Please enter a target URL');
      return;
    }

    // Create cache key from inputs
    const cacheKey = `${description.trim()}||${targetUrl.trim()}||${viewport || ''}`;

    // Check cache first
    const cached = generationCache.get(cacheKey);
    if (cached) {
      setGeneratedCode(cached.code);
      setTestName(cached.testName);
      return;
    }

    try {
      setGenerating(true);
      setGenerationError(null);
      setGeneratedCode('');
      setTestName('');

      const result = await generateTest(description, targetUrl, viewport);
      setGeneratedCode(result.code);
      setTestName(result.testName);

      // Cache the result
      generationCache.set(cacheKey, result);
    } catch (error: any) {
      console.error('Generation error:', error);
      setGenerationError(error.message || 'Failed to generate test code');
    } finally {
      setGenerating(false);
    }
  }, [generationCache]);

  // Reset all state
  const reset = useCallback(() => {
    setAnalysis(null);
    setAnalyzing(false);
    setAnalysisError(null);
    setGeneratedCode('');
    setTestName('');
    setGenerating(false);
    setGenerationError(null);

    // Clear caches
    analysisCache.clear();
    generationCache.clear();
  }, [analysisCache, generationCache]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setAnalysisError(null);
    setGenerationError(null);
  }, []);

  return {
    // Analysis state
    analysis,
    analyzing,
    analysisError,

    // Generation state
    generatedCode,
    testName,
    generating,
    generationError,

    // Data
    examples,
    templates,

    // Helper functions
    getAllExamples: memoizedGetAllExamples,
    getRandomExamples: memoizedGetRandomExamples,
    searchExamples: memoizedSearchExamples,
    getTemplateById: memoizedGetTemplateById,
    getTemplatesByCategory: memoizedGetTemplatesByCategory,
    getTemplateCategories: memoizedGetTemplateCategories,
    buildTemplate: memoizedBuildTemplate,

    // Actions
    analyze,
    generate,
    reset,
    clearErrors,
  };
}
