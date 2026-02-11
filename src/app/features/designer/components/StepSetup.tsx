'use client';

import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedSwitch, SwitchOption } from '@/components/ui/ThemedSwitch';
import { Wand2, FilePlus } from 'lucide-react';
import { getInputStyle, getLabelStyle, getErrorStyle } from '../lib/formHelpers';

export type SetupFlow = 'ai' | 'manual';

const flowOptions: SwitchOption<SetupFlow>[] = [
  { value: 'ai', label: 'AI', description: 'Analyze page & generate scenarios', icon: <Wand2 className="w-4 h-4" /> },
  { value: 'manual', label: 'Manual', description: 'Define scenarios yourself, no AI', icon: <FilePlus className="w-4 h-4" /> },
];

interface StepSetupProps {
  setupFlow: SetupFlow;
  setSetupFlow: (flow: SetupFlow) => void;
  testSuiteName: string;
  setTestSuiteName: (value: string) => void;
  targetUrl: string;
  setTargetUrl: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  manualScenarioNames?: string;
  setManualScenarioNames?: (value: string) => void;
  errors: Record<string, string>;
  onStartAnalysis: () => void;
  onAddManually?: () => void;
}

export function StepSetup({
  setupFlow,
  setSetupFlow,
  testSuiteName,
  setTestSuiteName,
  targetUrl,
  setTargetUrl,
  description,
  setDescription,
  manualScenarioNames = '',
  setManualScenarioNames,
  errors,
  onStartAnalysis,
  onAddManually,
}: StepSetupProps) {
  const { currentTheme } = useTheme();
  const isManual = setupFlow === 'manual';

  return (
    <ThemedCard variant="glow">
      <ThemedCardHeader title="Test Suite Setup" subtitle="Configure your test suite" icon={<Wand2 className="w-5 h-5" />} />
      <ThemedCardContent>
        <div className="space-y-6 mt-4">
          <ThemedSwitch
            options={flowOptions}
            value={setupFlow}
            onChange={setSetupFlow}
            label="Flow"
            testIdPrefix="setup-flow"
          />

          <div>
            <label className="block text-sm font-medium mb-2" style={getLabelStyle(currentTheme)}>
              Test Suite Name *
            </label>
            <input
              type="text"
              value={testSuiteName}
              onChange={(e) => setTestSuiteName(e.target.value)}
              placeholder="e.g., Homepage Tests"
              className="w-full px-4 py-3 rounded-lg transition-colors"
              style={getInputStyle(currentTheme, !!errors.testSuiteName)}
            />
            {errors.testSuiteName && <p className="text-sm mt-1" style={getErrorStyle()}>{errors.testSuiteName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={getLabelStyle(currentTheme)}>
              Target URL *
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg transition-colors"
              style={getInputStyle(currentTheme, !!errors.targetUrl)}
            />
            {errors.targetUrl && <p className="text-sm mt-1" style={getErrorStyle()}>{errors.targetUrl}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={getLabelStyle(currentTheme)}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this test suite covers..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg transition-colors resize-none active:outline-none focus:outline-none"
              style={getInputStyle(currentTheme)}
              data-testid="description-input"
            />
          </div>

          {isManual && onAddManually && setManualScenarioNames && (
            <div>
              <label className="block text-sm font-medium mb-2" style={getLabelStyle(currentTheme)}>
                Scenario names
              </label>
              <textarea
                value={manualScenarioNames}
                onChange={(e) => setManualScenarioNames(e.target.value)}
                placeholder="One per line or comma-separated, e.g. Login flow, Checkout, Homepage"
                rows={3}
                className="w-full px-4 py-3 rounded-lg transition-colors resize-none"
                style={getInputStyle(currentTheme)}
                data-testid="manual-scenario-names-input"
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isManual ? (
              onAddManually && (
                <ThemedButton variant="glow" size="lg" fullWidth onClick={onAddManually} leftIcon={<FilePlus className="w-5 h-5" />} data-testid="add-manually-btn">
                  Add manually (no AI)
                </ThemedButton>
              )
            ) : (
              <ThemedButton variant="glow" size="lg" fullWidth onClick={onStartAnalysis} leftIcon={<Wand2 className="w-5 h-5" />} data-testid="start-analysis-btn">
                Analyze & Generate Tests
              </ThemedButton>
            )}
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
}
