'use client';

import { useTheme } from '@/lib/stores/appStore';
import { FlowStep } from '../lib/flowTypes';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { Settings } from 'lucide-react';

interface StepEditorProps {
  step: FlowStep;
  onUpdate: (stepId: string, updates: Partial<FlowStep>) => void;
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  testId?: string;
  required?: boolean;
  className?: string;
  rows?: number;
  min?: number;
  step?: number;
  helpText?: string;
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  testId,
  required = false,
  className = '',
  rows,
  min,
  step,
  helpText
}: InputFieldProps) {
  const { currentTheme } = useTheme();
  const isTextarea = type === 'textarea';

  const inputStyle = {
    backgroundColor: currentTheme.colors.surface,
    color: currentTheme.colors.text.primary,
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: currentTheme.colors.border,
  };

  const baseClassName = `w-full px-3 py-2 rounded text-sm ${className}`;

  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: currentTheme.colors.text.primary }}
      >
        {label}{required && ' *'}
      </label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          style={inputStyle}
          rows={rows || 3}
          placeholder={placeholder}
          data-testid={testId}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          style={inputStyle}
          placeholder={placeholder}
          data-testid={testId}
          min={min}
          step={step}
        />
      )}
      {helpText && (
        <p
          className="text-xs mt-1"
          style={{ color: currentTheme.colors.text.tertiary }}
        >
          {helpText}
        </p>
      )}
    </div>
  );
}

export function StepEditor({ step, onUpdate }: StepEditorProps) {
  const handleConfigChange = (key: string, value: string | number) => {
    onUpdate(step.id, {
      config: {
        ...step.config,
        [key]: value,
      },
    });
  };

  const renderConfigFields = () => {
    const fields: React.ReactElement[] = [];

    // Common fields
    fields.push(
      <InputField
        key="description"
        label="Description"
        value={step.config.description || ''}
        onChange={(value) => handleConfigChange('description', value)}
        placeholder="Step description"
        testId="step-description-input"
      />
    );

    // Type-specific fields
    switch (step.type) {
      case 'navigate':
        fields.push(
          <InputField
            key="url"
            label="URL"
            type="url"
            value={step.config.url || ''}
            onChange={(value) => handleConfigChange('url', value)}
            placeholder="https://example.com"
            testId="step-url-input"
            required
          />
        );
        break;

      case 'click':
      case 'hover':
        fields.push(
          <InputField
            key="selector"
            label="Selector"
            value={step.config.selector || ''}
            onChange={(value) => handleConfigChange('selector', value)}
            placeholder='button[data-testid="submit"]'
            testId="step-selector-input"
            className="font-mono"
            helpText="CSS selector or text content"
            required
          />
        );
        break;

      case 'fill':
        fields.push(
          <InputField
            key="selector"
            label="Selector"
            value={step.config.selector || ''}
            onChange={(value) => handleConfigChange('selector', value)}
            placeholder='input[name="email"]'
            testId="step-selector-input"
            className="font-mono"
            required
          />,
          <InputField
            key="value"
            label="Value"
            value={step.config.value || ''}
            onChange={(value) => handleConfigChange('value', value)}
            placeholder="Text to enter"
            testId="step-value-input"
            required
          />
        );
        break;

      case 'select':
        fields.push(
          <InputField
            key="selector"
            label="Selector"
            value={step.config.selector || ''}
            onChange={(value) => handleConfigChange('selector', value)}
            placeholder='select[name="country"]'
            testId="step-selector-input"
            className="font-mono"
            required
          />,
          <InputField
            key="value"
            label="Option Value"
            value={step.config.value || ''}
            onChange={(value) => handleConfigChange('value', value)}
            placeholder="Option to select"
            testId="step-value-input"
            required
          />
        );
        break;

      case 'assert':
        fields.push(
          <InputField
            key="assertion"
            label="Assertion"
            type="textarea"
            value={step.config.assertion || ''}
            onChange={(value) => handleConfigChange('assertion', value)}
            placeholder="Condition to verify (e.g., page title contains 'Dashboard')"
            testId="step-assertion-input"
            className="font-mono"
            rows={3}
            required
          />,
          <InputField
            key="expectedResult"
            label="Expected Result"
            value={step.config.expectedResult || ''}
            onChange={(value) => handleConfigChange('expectedResult', value)}
            placeholder="Expected outcome"
            testId="step-expected-result-input"
          />
        );
        break;

      case 'verify':
        fields.push(
          <InputField
            key="selector"
            label="Selector"
            value={step.config.selector || ''}
            onChange={(value) => handleConfigChange('selector', value)}
            placeholder='.success-message'
            testId="step-selector-input"
            className="font-mono"
            required
          />,
          <InputField
            key="expectedResult"
            label="Expected Text/State"
            value={step.config.expectedResult || ''}
            onChange={(value) => handleConfigChange('expectedResult', value)}
            placeholder="Expected text or leave blank to check visibility"
            testId="step-expected-result-input"
          />
        );
        break;

      case 'wait':
        fields.push(
          <InputField
            key="timeout"
            label="Timeout (ms)"
            type="number"
            value={step.config.timeout || 3000}
            onChange={(value) => handleConfigChange('timeout', parseInt(value))}
            testId="step-timeout-input"
            min={100}
            step={100}
          />,
          <InputField
            key="selector"
            label="Wait for Selector (optional)"
            value={step.config.selector || ''}
            onChange={(value) => handleConfigChange('selector', value)}
            placeholder="Leave blank for fixed delay"
            testId="step-selector-input"
            className="font-mono"
          />
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
