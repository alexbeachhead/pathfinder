'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/stores/appStore';
import { FlowStep, PaletteItem } from '../lib/flowTypes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Trash2,
  Edit3,
  ArrowRight,
  MousePointer,
  Type,
  List,
  Move,
  CheckCircle,
  Eye,
  Camera,
  Clock,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight,
  MousePointer,
  Type,
  List,
  Move,
  CheckCircle,
  Eye,
  Camera,
  Clock,
};

interface FlowCanvasProps {
  steps: FlowStep[];
  selectedStepId: string | null;
  onAddStep: (item: PaletteItem, order: number) => void;
  onRemoveStep: (stepId: string) => void;
  onSelectStep: (stepId: string | null) => void;
  onReorderStep: (stepId: string, newOrder: number) => void;
}

interface ConfigBadgeProps {
  label: string;
  value: string;
}

function ConfigBadge({ label, value }: ConfigBadgeProps) {
  const { currentTheme } = useTheme();

  return (
    <span
      className="text-xs px-2 py-1 rounded"
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text.secondary,
      }}
    >
      {label}: {value}
    </span>
  );
}

export function FlowCanvas({
  steps,
  selectedStepId,
  onAddStep,
  onRemoveStep,
  onSelectStep,
  onReorderStep,
}: FlowCanvasProps) {
  const { currentTheme } = useTheme();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    try {
      const itemData = e.dataTransfer.getData('application/json');
      const item: PaletteItem = JSON.parse(itemData);
      onAddStep(item, index);
    } catch (error) {
      // Failed to parse dropped item - silently ignore
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  const getStepIcon = (type: string) => {
    const iconMapping: Record<string, string> = {
      navigate: 'ArrowRight',
      click: 'MousePointer',
      fill: 'Type',
      select: 'List',
      hover: 'Move',
      assert: 'CheckCircle',
      verify: 'Eye',
      screenshot: 'Camera',
      wait: 'Clock',
    };
    return iconMapping[type] || 'ArrowRight';
  };

  return (
    <div
      className="min-h-[500px] p-6 rounded-xl"
      style={{
        backgroundColor: currentTheme.colors.background,
        borderWidth: '2px',
        borderStyle: 'dashed',
        borderColor: currentTheme.colors.border,
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, steps.length)}
      data-testid="flow-canvas"
    >
      {steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderWidth: '2px',
              borderStyle: 'dashed',
              borderColor: currentTheme.colors.border,
            }}
          >
            <ArrowRight
              className="w-8 h-8"
              style={{ color: currentTheme.colors.text.tertiary }}
            />
          </div>
          <p
            className="text-lg font-medium mb-2"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            Drag steps here to build your test flow
          </p>
          <p
            className="text-sm"
            style={{ color: currentTheme.colors.text.tertiary }}
          >
            Choose actions, assertions, and utilities from the palette
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {sortedSteps.map((step, index) => {
              const IconComponent = iconMap[getStepIcon(step.type)];
              const isSelected = step.id === selectedStepId;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  {/* Drop zone before step */}
                  <div
                    className={`h-2 rounded transition-all ${
                      dragOverIndex === index ? 'h-12' : ''
                    }`}
                    style={{
                      backgroundColor:
                        dragOverIndex === index
                          ? currentTheme.colors.primary + '20'
                          : 'transparent',
                    }}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  />

                  {/* Step card */}
                  <div
                    className="p-4 rounded-lg cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? currentTheme.colors.primary + '15'
                        : currentTheme.colors.surface,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isSelected
                        ? currentTheme.colors.primary
                        : currentTheme.colors.border,
                    }}
                    onClick={() => onSelectStep(step.id)}
                    data-testid={`flow-step-${step.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: currentTheme.colors.primary + '20',
                          color: currentTheme.colors.primary,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div
                        className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center"
                        style={{
                          backgroundColor: currentTheme.colors.background,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: currentTheme.colors.border,
                        }}
                      >
                        {IconComponent && (
                          <div style={{ color: currentTheme.colors.accent }}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium capitalize"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {step.type}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: currentTheme.colors.text.tertiary }}
                        >
                          {step.config.description}
                        </p>

                        {/* Display key config values */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {step.config.url && <ConfigBadge label="URL" value={step.config.url} />}
                          {step.config.selector && <ConfigBadge label="Selector" value={step.config.selector} />}
                          {step.config.value && <ConfigBadge label="Value" value={step.config.value} />}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStep(step.id);
                          }}
                          className="p-2 rounded transition-colors"
                          style={{
                            backgroundColor: currentTheme.colors.background,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: currentTheme.colors.border,
                          }}
                          data-testid={`edit-step-${step.id}`}
                        >
                          <Edit3
                            className="w-4 h-4"
                            style={{ color: currentTheme.colors.text.secondary }}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveStep(step.id);
                          }}
                          className="p-2 rounded transition-colors hover:bg-red-500/20"
                          style={{
                            backgroundColor: currentTheme.colors.background,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: currentTheme.colors.border,
                          }}
                          data-testid={`delete-step-${step.id}`}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Drop zone at the end */}
          <div
            className={`h-2 rounded transition-all ${
              dragOverIndex === steps.length ? 'h-12' : ''
            }`}
            style={{
              backgroundColor:
                dragOverIndex === steps.length
                  ? currentTheme.colors.primary + '20'
                  : 'transparent',
            }}
            onDragOver={(e) => handleDragOver(e, steps.length)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, steps.length)}
          />
        </div>
      )}
    </div>
  );
}
