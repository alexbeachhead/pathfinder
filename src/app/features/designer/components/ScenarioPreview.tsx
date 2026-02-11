'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { TestScenario } from '@/lib/types';
import { CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

function createEmptyScenario(): TestScenario {
  return {
    id: crypto.randomUUID(),
    name: 'New scenario',
    description: '',
    priority: 'medium',
    category: 'functional',
    steps: [],
    expectedOutcomes: [],
    viewports: [],
  };
}

interface ScenarioPreviewProps {
  scenarios: TestScenario[];
  onScenariosChange?: (scenarios: TestScenario[]) => void;
}

export function ScenarioPreview({ scenarios, onScenariosChange }: ScenarioPreviewProps) {
  const { currentTheme } = useTheme();
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());

  const toggleScenario = (id: string) => {
    const newExpanded = new Set(expandedScenarios);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedScenarios(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return currentTheme.colors.text.tertiary;
      default:
        return currentTheme.colors.text.secondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'functional':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'visual':
        return <Info className="w-4 h-4" />;
      case 'responsive':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const canEdit = onScenariosChange != null;
  const showEmptyState = scenarios.length === 0 && canEdit;

  const updateScenarioName = (scenarioId: string, name: string) => {
    if (!onScenariosChange) return;
    const next = scenarios.map((s) => (s.id === scenarioId ? { ...s, name: name || s.name } : s));
    onScenariosChange(next);
  };

  const updateScenarioPriority = (scenarioId: string, priority: TestScenario['priority']) => {
    if (!onScenariosChange) return;
    const next = scenarios.map((s) => (s.id === scenarioId ? { ...s, priority } : s));
    onScenariosChange(next);
  };

  const priorityOptions: { value: TestScenario['priority']; label: string }[] = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  if (scenarios.length === 0 && !canEdit) {
    return null;
  }

  return (
    <ThemedCard variant="bordered">
      <ThemedCardHeader
        title={canEdit ? 'Test Scenarios' : 'Generated Test Scenarios'}
        subtitle={
          showEmptyState
            ? 'Add scenarios manually'
            : `${scenarios.length} scenario${scenarios.length !== 1 ? 's' : ''}${canEdit ? '' : ' detected'}`
        }
        icon={<CheckCircle2 className="w-5 h-5" />}
      />
      <ThemedCardContent>
        {showEmptyState && (
          <div className="mt-4 flex flex-col items-center justify-center py-8">
            <p className="text-sm mb-4" style={{ color: currentTheme.colors.text.secondary }}>
              No scenarios yet. Add your first scenario block.
            </p>
            <button
              type="button"
              onClick={() => onScenariosChange!([createEmptyScenario()])}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: `${currentTheme.colors.primary}20`,
                color: currentTheme.colors.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.primary,
              }}
              data-testid="add-first-scenario-btn"
            >
              <Plus className="w-4 h-4" /> Add scenario
            </button>
          </div>
        )}
        <div className="mt-4 space-y-3">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-lg overflow-hidden transition-all"
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: expandedScenarios.has(scenario.id)
                  ? currentTheme.colors.borderHover
                  : currentTheme.colors.border,
                backgroundColor: currentTheme.colors.surface,
              }}
            >
              {/* Header - icon and chevron toggle expand; name is editable when canEdit */}
              <div
                className="w-full p-4 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleScenario(scenario.id)}
                    className="shrink-0 p-0.5 rounded -m-0.5 cursor-pointer"
                    style={{ color: currentTheme.colors.accent }}
                    aria-label={expandedScenarios.has(scenario.id) ? 'Collapse' : 'Expand'}
                  >
                    {getCategoryIcon(scenario.category)}
                  </button>
                  <div className="flex-1 min-w-0">
                    {canEdit ? (
                      <input
                        type="text"
                        value={scenario.name}
                        onChange={(e) => updateScenarioName(scenario.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="font-medium text-sm w-full rounded px-2 py-1 block min-h-[28px] focus:outline-none"
                        style={{
                          color: currentTheme.colors.text.primary,
                          backgroundColor: currentTheme.colors.surface,
                          borderWidth: '2px',
                          borderStyle: 'solid',
                          borderColor: currentTheme.colors.border,
                          outline: 'none',
                        }}
                        data-testid={`scenario-name-input-${scenario.id}`}
                        placeholder="Scenario name"
                        title="Click to edit scenario name"
                      />
                    ) : (
                      <h4
                        className="font-medium text-sm truncate cursor-pointer"
                        style={{ color: currentTheme.colors.text.primary }}
                        onClick={() => toggleScenario(scenario.id)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleScenario(scenario.id)}
                        role="button"
                        tabIndex={0}
                      >
                        {scenario.name}
                      </h4>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {canEdit ? (
                        <select
                          value={scenario.priority}
                          onChange={(e) => updateScenarioPriority(scenario.id, e.target.value as TestScenario['priority'])}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-0"
                          style={{
                            backgroundColor: `${getPriorityColor(scenario.priority)}15`,
                            color: getPriorityColor(scenario.priority),
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: `${getPriorityColor(scenario.priority)}30`,
                            minWidth: '4.5rem',
                          }}
                          data-testid={`scenario-priority-select-${scenario.id}`}
                          title="Priority"
                        >
                          {priorityOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${getPriorityColor(scenario.priority)}15`,
                            color: getPriorityColor(scenario.priority),
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: `${getPriorityColor(scenario.priority)}30`,
                          }}
                        >
                          {scenario.priority}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                        {scenario.category}
                      </span>
                      <span className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                        {scenario.steps.length} steps
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = scenarios.filter((s) => s.id !== scenario.id);
                        onScenariosChange!(next);
                      }}
                      className="p-1.5 rounded opacity-70 hover:opacity-100 transition-opacity"
                      style={{ color: currentTheme.colors.text.tertiary }}
                      aria-label={`Remove ${scenario.name}`}
                      data-testid={`remove-scenario-${scenario.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleScenario(scenario.id)}
                    className="p-1 rounded"
                    style={{ color: currentTheme.colors.text.secondary }}
                    aria-label={expandedScenarios.has(scenario.id) ? 'Collapse' : 'Expand'}
                  >
                    {expandedScenarios.has(scenario.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedScenarios.has(scenario.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-4 pb-4 space-y-3"
                      style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: currentTheme.colors.border }}
                    >
                      <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                        {scenario.description}
                      </p>

                      {/* Steps */}
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.colors.text.tertiary }}>
                          Test Steps:
                        </p>
                        <ol className="space-y-2">
                          {scenario.steps.map((step, stepIndex) => (
                            <li
                              key={stepIndex}
                              className="text-xs flex gap-2"
                              style={{ color: currentTheme.colors.text.secondary }}
                            >
                              <span style={{ color: currentTheme.colors.accent }}>{stepIndex + 1}.</span>
                              <span>{step.description}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Expected Outcomes */}
                      {scenario.expectedOutcomes && scenario.expectedOutcomes.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.colors.text.tertiary }}>
                            Expected Outcomes:
                          </p>
                          <ul className="space-y-1">
                            {scenario.expectedOutcomes.map((outcome, outIndex) => (
                              <li
                                key={outIndex}
                                className="text-xs flex gap-2"
                                style={{ color: currentTheme.colors.text.secondary }}
                              >
                                <span style={{ color: '#22c55e' }}>✓</span>
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Viewports */}
                      {scenario.viewports && scenario.viewports.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                            Viewports:
                          </span>
                          {scenario.viewports.map((viewport) => (
                            <span
                              key={viewport}
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${currentTheme.colors.primary}10`,
                                color: currentTheme.colors.text.secondary,
                              }}
                            >
                              {viewport}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {canEdit && scenarios.length > 0 && (
            <button
              type="button"
              onClick={() => onScenariosChange!([...scenarios, createEmptyScenario()])}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed transition-colors"
              style={{
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.secondary,
                backgroundColor: 'transparent',
              }}
              data-testid="add-scenario-btn"
            >
              <Plus className="w-4 h-4" /> Add scenario
            </button>
          )}
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
}
