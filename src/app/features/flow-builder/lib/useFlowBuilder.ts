'use client';

import { useState, useCallback, useMemo } from 'react';
import { TestFlow, FlowStep, FlowStepConfig, StepType } from './flowTypes';
import { validateFlow, serializeFlow } from './flowSerializer';

export interface UseFlowBuilderOptions {
  initialFlow?: TestFlow;
  onChange?: (flow: TestFlow) => void;
}

export function useFlowBuilder(options: UseFlowBuilderOptions = {}) {
  const { initialFlow, onChange } = options;

  // Initialize flow state
  const [flow, setFlow] = useState<TestFlow>(
    initialFlow || {
      id: `flow-${Date.now()}`,
      name: '',
      description: '',
      steps: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  );

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Update flow and trigger callbacks
  const updateFlow = useCallback(
    (updater: TestFlow | ((prev: TestFlow) => TestFlow)) => {
      setFlow(prev => {
        const updated = typeof updater === 'function' ? updater(prev) : updater;
        const withTimestamp: TestFlow = {
          ...updated,
          metadata: {
            ...(updated.metadata || {}),
            createdAt: updated.metadata?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
        setIsDirty(true);
        onChange?.(withTimestamp);
        return withTimestamp;
      });
    },
    [onChange]
  );

  // Add a step to the flow
  const addStep = useCallback(
    (type: StepType, config: Partial<FlowStepConfig> = {}) => {
      const newStep: FlowStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        order: flow.steps.length,
        config: {
          description: config.description || `${type} step`,
          ...config,
        },
      };

      updateFlow(prev => ({
        ...prev,
        steps: [...prev.steps, newStep],
      }));

      setSelectedStepId(newStep.id);
      return newStep.id;
    },
    [flow.steps.length, updateFlow]
  );

  // Remove a step from the flow
  const removeStep = useCallback(
    (stepId: string) => {
      updateFlow(prev => {
        const filteredSteps = prev.steps.filter(s => s.id !== stepId);
        // Re-order remaining steps
        const reorderedSteps = filteredSteps.map((step, index) => ({
          ...step,
          order: index,
        }));

        return {
          ...prev,
          steps: reorderedSteps,
        };
      });

      if (selectedStepId === stepId) {
        setSelectedStepId(null);
      }
    },
    [updateFlow, selectedStepId]
  );

  // Update a step's configuration
  const updateStep = useCallback(
    (stepId: string, updates: Partial<FlowStep>) => {
      updateFlow(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId ? { ...step, ...updates } : step
        ),
      }));
    },
    [updateFlow]
  );

  // Move a step to a new position
  const moveStep = useCallback(
    (stepId: string, newOrder: number) => {
      updateFlow(prev => {
        const steps = [...prev.steps];
        const stepIndex = steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return prev;

        const [movedStep] = steps.splice(stepIndex, 1);
        steps.splice(newOrder, 0, movedStep);

        // Re-order all steps
        const reorderedSteps = steps.map((step, index) => ({
          ...step,
          order: index,
        }));

        return {
          ...prev,
          steps: reorderedSteps,
        };
      });
    },
    [updateFlow]
  );

  // Update flow metadata
  const updateMetadata = useCallback(
    (updates: Partial<TestFlow>) => {
      updateFlow(prev => ({
        ...prev,
        ...updates,
      }));
    },
    [updateFlow]
  );

  // Clear the flow
  const clearFlow = useCallback(() => {
    updateFlow({
      id: `flow-${Date.now()}`,
      name: '',
      description: '',
      steps: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    setSelectedStepId(null);
    setIsDirty(false);
  }, [updateFlow]);

  // Load a flow
  const loadFlow = useCallback((newFlow: TestFlow) => {
    setFlow(newFlow);
    setSelectedStepId(null);
    setIsDirty(false);
  }, []);

  // Validation
  const validation = useMemo(() => validateFlow(flow), [flow]);

  // Selected step
  const selectedStep = useMemo(
    () => flow.steps.find(s => s.id === selectedStepId) || null,
    [flow.steps, selectedStepId]
  );

  // Export flow as JSON
  const exportJson = useCallback(() => {
    return serializeFlow(flow);
  }, [flow]);

  return {
    // State
    flow,
    selectedStepId,
    selectedStep,
    isDirty,
    validation,

    // Actions
    addStep,
    removeStep,
    updateStep,
    moveStep,
    updateMetadata,
    clearFlow,
    loadFlow,
    setSelectedStepId,
    exportJson,
  };
}
