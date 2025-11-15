'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { CheckCircle2, GitBranch } from 'lucide-react';
import { CodeLanguage } from '@/lib/types';
import { CIPipelineWizard } from './CIPipelineWizard';

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
        <div className="p-8 text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 mx-auto" style={{ color: '#22c55e' }} />
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
              Test Suite Created!
            </h2>
            <p className="text-lg" style={{ color: currentTheme.colors.text.secondary }}>
              Your test suite &quot;{testSuiteName}&quot; has been saved successfully.
            </p>
          </div>

          {/* CI/CD Integration Callout */}
          <div
            className="p-4 rounded-lg border-2 border-dashed"
            style={{
              borderColor: currentTheme.colors.accent,
              backgroundColor: `${currentTheme.colors.accent}15`,
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <GitBranch className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
              <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                Ready for CI/CD?
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: currentTheme.colors.text.secondary }}>
              Generate a ready-to-use GitHub Actions or GitLab CI pipeline for your test suite
            </p>
            <ThemedButton
              variant="primary"
              size="lg"
              onClick={() => setShowCIWizard(true)}
              data-testid="generate-ci-pipeline-btn"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Generate CI/CD Pipeline
            </ThemedButton>
          </div>

          <div className="flex items-center justify-center gap-4">
            <ThemedButton variant="secondary" size="lg" onClick={onReset} data-testid="create-another-btn">
              Create Another
            </ThemedButton>
            <ThemedButton variant="primary" size="lg" onClick={onRunTests} data-testid="run-tests-btn">
              Run Tests
            </ThemedButton>
          </div>
        </div>
      </ThemedCard>

      {showCIWizard && (
        <CIPipelineWizard
          testSuiteName={testSuiteName}
          targetUrl={targetUrl}
          codeLanguage={codeLanguage}
          generatedCode={generatedCode}
          onClose={() => setShowCIWizard(false)}
        />
      )}
    </>
  );
}
