'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { CheckCircle2, GitBranch, Play, PlusCircle, Sparkles } from 'lucide-react';
import { CodeLanguage } from '@/lib/types';
import { CIPipelineWizard } from '../sub_CICD/CIPipelineWizard';

interface StepCompleteProps {
  testSuiteName: string;
  targetUrl: string;
  codeLanguage: CodeLanguage;
  generatedCode: string;
  onReset: () => void;
  onRunTests: () => void;
}

export function StepComplete({
  testSuiteName,
  targetUrl,
  codeLanguage,
  generatedCode,
  onReset,
  onRunTests,
}: StepCompleteProps) {
  const { currentTheme } = useTheme();
  const [showCIWizard, setShowCIWizard] = useState(false);

  return (
    <>
      <ThemedCard variant="glow">
        <div className="p-8 text-center space-y-8">
          {/* Success Icon with Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
          >
              <CheckCircle2 className="w-24 h-24 mx-auto" style={{ color: '#22c55e' }} />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold mb-3" style={{ color: currentTheme.colors.text.primary }}>
              Test Suite Created!
            </h2>
            <p className="text-lg max-w-md mx-auto" style={{ color: currentTheme.colors.text.secondary }}>
              <span className="font-semibold" style={{ color: currentTheme.colors.accent }}>
                &quot;{testSuiteName}&quot;
              </span>{' '}
              has been saved successfully and is ready to run.
            </p>
          </motion.div>

            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
            </motion.div>
          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ThemedButton
              variant="secondary"
              size="lg"
              onClick={onReset}
              data-testid="create-another-btn"
              leftIcon={<PlusCircle />}
            >
              Create Another
            </ThemedButton>
            <ThemedButton
              variant="glow"
              size="lg"
              onClick={() => setShowCIWizard(true)}
              data-testid="generate-ci-pipeline-btn"
              leftIcon={<GitBranch />}
            >
              Generate CI/CD Pipeline
            </ThemedButton>
            <ThemedButton
              variant="primary"
              size="lg"
              onClick={onRunTests}
              data-testid="run-tests-btn"
              leftIcon={<Play />}
            >
              Run Tests Now
            </ThemedButton>
          </motion.div>
        </div>
      </ThemedCard>

      <AnimatePresence>
        {showCIWizard && (
          <CIPipelineWizard
            testSuiteName={testSuiteName}
            targetUrl={targetUrl}
            codeLanguage={codeLanguage}
            generatedCode={generatedCode}
            onClose={() => setShowCIWizard(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
