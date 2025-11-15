'use client';

import { useTheme } from '@/lib/stores/appStore';
import { FlowStep } from '../lib/flowTypes';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { Settings } from 'lucide-react';

interface StepEditorProps {
  step: FlowStep;
  onUpdate: (stepId: string, updates: Partial<FlowStep>) => void;
}

export function StepEditor({ step, onUpdate }: StepEditorProps) {
  const { currentTheme } = useTheme();

  const handleConfigChange = (key: string, value: string | number) => {
    onUpdate(step.id, {
      config: {
        ...step.config,
        [key]: value,
      },
    });
  };

  const renderConfigFields = () => {
    const fields: JSX.Element[] = [];

    // Common fields
    fields.push(
      <div key="description">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: currentTheme.colors.text.primary }}
        >
          Description
        </label>
        <input
          type="text"
          value={step.config.description || ''}
          onChange={(e) => handleConfigChange('description', e.target.value)}
          className="w-full px-3 py-2 rounded text-sm"
          style={{
            backgroundColor: currentTheme.colors.surface,
            color: currentTheme.colors.text.primary,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: currentTheme.colors.border,
          }}
          placeholder="Step description"
          data-testid="step-description-input"
        />
      </div>
    );

    // Type-specific fields
    switch (step.type) {
      case 'navigate':
        fields.push(
          <div key="url">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              URL *
            </label>
            <input
              type="url"
              value={step.config.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder="https://example.com"
              data-testid="step-url-input"
            />
          </div>
        );
        break;

      case 'click':
      case 'hover':
        fields.push(
          <div key="selector">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Selector *
            </label>
            <input
              type="text"
              value={step.config.selector || ''}
              onChange={(e) => handleConfigChange('selector', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder='button[data-testid="submit"]'
              data-testid="step-selector-input"
            />
            <p
              className="text-xs mt-1"
              style={{ color: currentTheme.colors.text.tertiary }}
            >
              CSS selector or text content
            </p>
          </div>
        );
        break;

      case 'fill':
        fields.push(
          <div key="selector">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Selector *
            </label>
            <input
              type="text"
              value={step.config.selector || ''}
              onChange={(e) => handleConfigChange('selector', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder='input[name="email"]'
              data-testid="step-selector-input"
            />
          </div>,
          <div key="value">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Value *
            </label>
            <input
              type="text"
              value={step.config.value || ''}
              onChange={(e) => handleConfigChange('value', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder="Text to enter"
              data-testid="step-value-input"
            />
          </div>
        );
        break;

      case 'select':
        fields.push(
          <div key="selector">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Selector *
            </label>
            <input
              type="text"
              value={step.config.selector || ''}
              onChange={(e) => handleConfigChange('selector', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder='select[name="country"]'
              data-testid="step-selector-input"
            />
          </div>,
          <div key="value">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Option Value *
            </label>
            <input
              type="text"
              value={step.config.value || ''}
              onChange={(e) => handleConfigChange('value', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder="Option to select"
              data-testid="step-value-input"
            />
          </div>
        );
        break;

      case 'assert':
        fields.push(
          <div key="assertion">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Assertion *
            </label>
            <textarea
              value={step.config.assertion || ''}
              onChange={(e) => handleConfigChange('assertion', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              rows={3}
              placeholder="Condition to verify (e.g., page title contains 'Dashboard')"
              data-testid="step-assertion-input"
            />
          </div>,
          <div key="expectedResult">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Expected Result
            </label>
            <input
              type="text"
              value={step.config.expectedResult || ''}
              onChange={(e) => handleConfigChange('expectedResult', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder="Expected outcome"
              data-testid="step-expected-result-input"
            />
          </div>
        );
        break;

      case 'verify':
        fields.push(
          <div key="selector">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Selector *
            </label>
            <input
              type="text"
              value={step.config.selector || ''}
              onChange={(e) => handleConfigChange('selector', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder='.success-message'
              data-testid="step-selector-input"
            />
          </div>,
          <div key="expectedResult">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Expected Text/State
            </label>
            <input
              type="text"
              value={step.config.expectedResult || ''}
              onChange={(e) => handleConfigChange('expectedResult', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder="Expected text or leave blank to check visibility"
              data-testid="step-expected-result-input"
            />
          </div>
        );
        break;

      case 'wait':
        fields.push(
          <div key="timeout">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Timeout (ms)
            </label>
            <input
              type="number"
              value={step.config.timeout || 3000}
              onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              min={100}
              step={100}
              data-testid="step-timeout-input"
            />
          </div>,
          <div key="selector">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Wait for Selector (optional)
            </label>
            <input
              type="text"
              value={step.config.selector || ''}
              onChange={(e) => handleConfigChange('selector', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              placeholder="Leave blank for fixed delay"
              data-testid="step-selector-input"
            />
          </div>
        );
        break;
    }

    return fields;
  };

  return (
    <ThemedCard variant="bordered">
      <ThemedCardHeader
        title={`Edit ${step.type} Step`}
        subtitle="Configure step parameters"
        icon={<Settings className="w-5 h-5" />}
      />
      <ThemedCardContent>
        <div className="space-y-4">
          {renderConfigFields()}
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
}
