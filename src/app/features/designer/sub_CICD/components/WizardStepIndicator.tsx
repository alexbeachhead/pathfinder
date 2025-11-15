'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { WizardStep } from '../lib/ciHelpers';
import { Check } from 'lucide-react';

interface StepConfig {
  id: WizardStep;
  label: string;
  number: number;
}

interface WizardStepIndicatorProps {
  currentStep: WizardStep;
}

const STEPS: StepConfig[] = [
  { id: 'select-provider', label: 'Select Provider', number: 1 },
  { id: 'configure', label: 'Configure', number: 2 },
  { id: 'deploy', label: 'Deploy', number: 3 },
];

export function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
  const { currentTheme } = useTheme();

  const getCurrentStepIndex = () => {
    return STEPS.findIndex((step) => step.id === currentStep);
  };

  const isStepCompleted = (stepIndex: number) => {
    return stepIndex < getCurrentStepIndex();
  };

  const isStepActive = (stepId: WizardStep) => {
    return stepId === currentStep;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {STEPS.map((step, index) => {
        const isCompleted = isStepCompleted(index);
        const isActive = isStepActive(step.id);
        const isFuture = index > getCurrentStepIndex();

        return (
          <div key={step.id} className="flex items-center gap-2">
            {/* Step Circle */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: isCompleted || isActive
                    ? currentTheme.colors.accent
                    : currentTheme.colors.surface,
                }}
                whileHover={{ scale: 1.05 }}
                animate={
                  isActive
                    ? {
                        boxShadow: [
                          `0 0 0 0 ${currentTheme.colors.accent}40`,
                          `0 0 0 10px ${currentTheme.colors.accent}00`,
                        ],
                      }
                    : {}
                }
                transition={
                  isActive
                    ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                    : {}
                }
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <Check
                      className="w-5 h-5"
                      style={{ color: currentTheme.colors.text.primary }}
                    />
                  </motion.div>
                ) : (
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: isActive || isCompleted
                        ? currentTheme.colors.text.primary
                        : currentTheme.colors.text.tertiary,
                    }}
                  >
                    {step.number}
                  </span>
                )}
              </motion.div>

              {/* Step Label */}
              <motion.span
                className="text-sm font-medium whitespace-nowrap"
                style={{
                  color: isActive
                    ? currentTheme.colors.text.primary
                    : isFuture
                    ? currentTheme.colors.text.tertiary
                    : currentTheme.colors.text.secondary,
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.05 }}
              >
                {step.label}
              </motion.span>
            </motion.div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <motion.div
                className="h-0.5 w-16 mx-2"
                style={{
                  backgroundColor: isCompleted
                    ? currentTheme.colors.accent
                    : currentTheme.colors.border,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
