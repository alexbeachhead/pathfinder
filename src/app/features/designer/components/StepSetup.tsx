'use client';

import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedSwitch, SwitchOption } from '@/components/ui/ThemedSwitch';
import { Wand2, Code, Zap, Camera } from 'lucide-react';
import { MascotConfig, CodeLanguage, PreviewMode } from '@/lib/types';
import { MascotCustomizer } from '../sub_Mascot/MascotCustomizer';
import { getInputStyle, getLabelStyle, getErrorStyle } from '../lib/formHelpers';

interface StepSetupProps {
  testSuiteName: string;
  setTestSuiteName: (value: string) => void;
  targetUrl: string;
  setTargetUrl: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  mascotConfig: MascotConfig;
  setMascotConfig: (config: MascotConfig) => void;
  codeLanguage: CodeLanguage;
  setCodeLanguage: (language: CodeLanguage) => void;
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  errors: Record<string, string>;
  onStartAnalysis: () => void;
}

// Code language options
const codeLanguageOptions: SwitchOption<CodeLanguage>[] = [
  {
    value: 'typescript',
    label: 'TypeScript',
    description: 'Type-safe with IDE support',
  },
  {
    value: 'javascript',
    label: 'JavaScript',
    description: 'Simple and widely compatible',
  },
];

// Preview mode options
const previewModeOptions: SwitchOption<PreviewMode>[] = [
  {
    value: 'lightweight',
    label: 'Lightweight',
    description: 'Fast loading, lower memory',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    value: 'full',
    label: 'Full Rendering',
    description: 'Accurate visuals, high fidelity',
    icon: <Camera className="w-4 h-4" />,
  },
];

export function StepSetup({
  testSuiteName,
  setTestSuiteName,
  targetUrl,
  setTargetUrl,
  description,
  setDescription,
  mascotConfig,
  setMascotConfig,
  codeLanguage,
  setCodeLanguage,
  previewMode,
  setPreviewMode,
  errors,
  onStartAnalysis,
}: StepSetupProps) {
  const { currentTheme } = useTheme();

  return (
    <ThemedCard variant="glow">
      <ThemedCardHeader title="Test Suite Setup" subtitle="Configure your test suite" icon={<Wand2 className="w-5 h-5" />} />
      <ThemedCardContent>
        <div className="space-y-6 mt-4">
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

          {/* Code Language Selection */}
          <ThemedSwitch
            options={codeLanguageOptions}
            value={codeLanguage}
            onChange={setCodeLanguage}
            label="Generated Code Format"
            icon={<Code className="w-4 h-4" />}
            testIdPrefix="language"
          />

          {/* Preview Mode Selection */}
          <ThemedSwitch
            options={previewModeOptions}
            value={previewMode}
            onChange={setPreviewMode}
            label="Preview Rendering Mode"
            icon={<Camera className="w-4 h-4" />}
            helpText={(mode) =>
              mode === 'lightweight'
                ? 'Lightweight mode uses DOM snapshots for quick previews with minimal resource usage.'
                : 'Full rendering mode captures actual screenshots for precise visual feedback.'
            }
            testIdPrefix="preview-mode"
          />

          {/* Mascot Customization */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${currentTheme.colors.surface}40`,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: currentTheme.colors.border,
            }}
          >
            <MascotCustomizer config={mascotConfig} onChange={setMascotConfig} />
          </div>

          <ThemedButton variant="glow" size="lg" fullWidth onClick={onStartAnalysis} leftIcon={<Wand2 className="w-5 h-5" />} data-testid="start-analysis-btn">
            Analyze & Generate Tests
          </ThemedButton>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
}
