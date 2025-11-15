'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { Badge } from '@/components/ui/Badge';
import { Clock, Sparkles, Target, Zap } from 'lucide-react';
import { useAdaptiveDifficulty } from './AdaptiveDifficultyContext';
import { DifficultyBadge } from './DifficultyBadge';
import { PromptDifficulty } from '../lib/difficultyScoring';
import { preparePromptsWithDifficulty } from '../lib/adaptivePromptSelector';
import { EXAMPLE_PROMPTS } from '@/lib/nl-test/testEngine';

interface AdaptivePromptSelectorProps {
  onSelectPrompt: (promptText: string) => void;
}

export function AdaptivePromptSelector({ onSelectPrompt }: AdaptivePromptSelectorProps) {
  const { currentTheme } = useTheme();
  const { userStats, getRecommendations } = useAdaptiveDifficulty();
  const [selectedTab, setSelectedTab] = useState<'optimal' | 'challenging' | 'review'>('optimal');
  const [prompts, setPrompts] = useState<PromptDifficulty[]>([]);

  useEffect(() => {
    // Prepare all example prompts with difficulty scores
    const allPrompts = EXAMPLE_PROMPTS.flatMap(category =>
      category.examples.map((text, idx) => ({
        id: `${category.category}-${idx}`,
        text,
        category: category.category,
      }))
    );

    const prepared = preparePromptsWithDifficulty(allPrompts);
    setPrompts(prepared);
  }, []);

  const recommendations = prompts.length > 0 ? getRecommendations(prompts) : null;

  const tabs = [
    {
      id: 'optimal' as const,
      label: 'Recommended',
      icon: <Target className="w-3 h-3" />,
      description: 'Perfect for your level',
    },
    {
      id: 'challenging' as const,
      label: 'Challenge',
      icon: <Zap className="w-3 h-3" />,
      description: 'Push your skills',
    },
    {
      id: 'review' as const,
      label: 'Review',
      icon: <Sparkles className="w-3 h-3" />,
      description: 'Reinforce knowledge',
    },
  ];

  const currentPrompts = recommendations
    ? recommendations[selectedTab]
    : [];

  return (
    <ThemedCard variant="bordered" data-testid="adaptive-prompt-selector">
      <ThemedCardHeader
        title="AI-Recommended Prompts"
        subtitle={`Personalized for your skill level (${scoreToLabel(userStats.currentDifficulty)})`}
        icon={<Sparkles className="w-5 h-5" />}
      />
      <ThemedCardContent>
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className="flex-1 px-3 py-2 rounded text-xs transition-all"
                style={{
                  backgroundColor: selectedTab === tab.id
                    ? currentTheme.colors.primary
                    : currentTheme.colors.surface,
                  color: selectedTab === tab.id
                    ? '#ffffff'
                    : currentTheme.colors.text.secondary,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: selectedTab === tab.id
                    ? currentTheme.colors.primary
                    : currentTheme.colors.border,
                }}
                data-testid={`tab-${tab.id}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Tab Description */}
          <p className="text-xs text-center" style={{ color: currentTheme.colors.text.secondary }}>
            {tabs.find(t => t.id === selectedTab)?.description}
          </p>

          {/* Prompts List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {currentPrompts.length === 0 ? (
                <div
                  className="text-center py-6 text-sm"
                  style={{ color: currentTheme.colors.text.secondary }}
                  data-testid="no-prompts-message"
                >
                  No prompts available for this category
                </div>
              ) : (
                currentPrompts.map((result, idx) => (
                  <motion.button
                    key={result.prompt.promptId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onSelectPrompt(result.prompt.promptText)}
                    className="w-full text-left p-3 rounded transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: currentTheme.colors.surface,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: currentTheme.colors.border,
                    }}
                    data-testid={`prompt-option-${idx}`}
                  >
                    <div className="space-y-2">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2" style={{ color: currentTheme.colors.text.primary }}>
                            {result.prompt.promptText}
                          </p>
                          <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.tertiary }}>
                            {result.reason}
                          </p>
                        </div>
                        <DifficultyBadge level={result.prompt.difficulty.level} />
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-xs">
                        <Badge variant="default">{result.prompt.category}</Badge>

                        <div className="flex items-center gap-1" style={{ color: currentTheme.colors.text.secondary }}>
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(result.prompt.estimatedTime)}</span>
                        </div>

                        <div className="flex items-center gap-1" style={{ color: currentTheme.colors.accent }}>
                          <Sparkles className="w-3 h-3" />
                          <span>{Math.round(result.confidence * 100)}% match</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

function scoreToLabel(score: number): string {
  if (score <= 3) return 'Beginner';
  if (score <= 6) return 'Intermediate';
  if (score <= 8.5) return 'Advanced';
  return 'Expert';
}
