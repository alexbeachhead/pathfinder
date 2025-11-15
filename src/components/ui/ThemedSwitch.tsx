'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/lib/stores/appStore';

export interface SwitchOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface ThemedSwitchProps<T extends string = string> {
  options: SwitchOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  icon?: ReactNode;
  helpText?: string | ((value: T) => string);
  testIdPrefix?: string;
}

export function ThemedSwitch<T extends string = string>({
  options,
  value,
  onChange,
  label,
  icon,
  helpText,
  testIdPrefix,
}: ThemedSwitchProps<T>) {
  const { currentTheme } = useTheme();

  const resolvedHelpText = typeof helpText === 'function' ? helpText(value) : helpText;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
          {icon && <span className="inline-flex items-center mr-1.5">{icon}</span>}
          {label}
        </label>
      )}
      <div className="flex gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="flex-1 px-4 py-3 rounded-lg transition-all font-medium text-sm"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: isSelected ? currentTheme.colors.accent : currentTheme.colors.border,
                color: isSelected ? currentTheme.colors.accent : currentTheme.colors.text.primary,
              }}
              data-testid={testIdPrefix ? `${testIdPrefix}-${option.value}-btn` : undefined}
            >
              <div className="flex flex-col items-center gap-1">
                {option.icon ? (
                  <div className="flex items-center gap-1.5">
                    {option.icon}
                    <span className="font-bold">{option.label}</span>
                  </div>
                ) : (
                  <span className="font-bold">{option.label}</span>
                )}
                {option.description && (
                  <span className="text-xs opacity-75">{option.description}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {resolvedHelpText && (
        <p className="text-xs mt-2" style={{ color: currentTheme.colors.text.tertiary }}>
          {resolvedHelpText}
        </p>
      )}
    </div>
  );
}
