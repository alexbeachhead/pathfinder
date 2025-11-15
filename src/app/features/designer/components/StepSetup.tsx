'use client';

import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { Wand2, Code, Zap, Camera } from 'lucide-react';
import { MascotConfig, CodeLanguage, PreviewMode } from '@/lib/types';
import { MascotCustomizer } from './MascotCustomizer';

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
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
              Test Suite Name *
            </label>
            <input
              type="text"
              value={testSuiteName}
              onChange={(e) => setTestSuiteName(e.target.value)}
              placeholder="e.g., Homepage Tests"
              className="w-full px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: errors.testSuiteName ? '#ef4444' : currentTheme.colors.border,
                color: currentTheme.colors.text.primary,
              }}
            />
            {errors.testSuiteName && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.testSuiteName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
              Target URL *
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: errors.targetUrl ? '#ef4444' : currentTheme.colors.border,
                color: currentTheme.colors.text.primary,
              }}
            />
            {errors.targetUrl && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.targetUrl}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this test suite covers..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg transition-colors resize-none"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.primary,
              }}
              data-testid="description-input"
            />
          </div>

          {/* Code Language Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
              <Code className="w-4 h-4 inline-block mr-1.5" />
              Generated Code Format
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCodeLanguage('typescript')}
                className="flex-1 px-4 py-3 rounded-lg transition-all font-medium text-sm"
                style={{
                  backgroundColor: codeLanguage === 'typescript' ? currentTheme.colors.accent : currentTheme.colors.surface,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: codeLanguage === 'typescript' ? currentTheme.colors.accent : currentTheme.colors.border,
                  color: codeLanguage === 'typescript' ? '#ffffff' : currentTheme.colors.text.primary,
                }}
                data-testid="language-typescript-btn"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold">TypeScript</span>
                  <span className="text-xs opacity-75">Type-safe with IDE support</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setCodeLanguage('javascript')}
                className="flex-1 px-4 py-3 rounded-lg transition-all font-medium text-sm"
                style={{
                  backgroundColor: codeLanguage === 'javascript' ? currentTheme.colors.accent : currentTheme.colors.surface,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: codeLanguage === 'javascript' ? currentTheme.colors.accent : currentTheme.colors.border,
                  color: codeLanguage === 'javascript' ? '#ffffff' : currentTheme.colors.text.primary,
                }}
                data-testid="language-javascript-btn"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold">JavaScript</span>
                  <span className="text-xs opacity-75">Simple and widely compatible</span>
                </div>
              </button>
            </div>
          </div>

          {/* Preview Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
              <Camera className="w-4 h-4 inline-block mr-1.5" />
              Preview Rendering Mode
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPreviewMode('lightweight')}
                className="flex-1 px-4 py-3 rounded-lg transition-all font-medium text-sm"
                style={{
                  backgroundColor: previewMode === 'lightweight' ? currentTheme.colors.accent : currentTheme.colors.surface,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: previewMode === 'lightweight' ? currentTheme.colors.accent : currentTheme.colors.border,
                  color: previewMode === 'lightweight' ? '#ffffff' : currentTheme.colors.text.primary,
                }}
                data-testid="preview-mode-lightweight-btn"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span className="font-bold">Lightweight</span>
                  </div>
                  <span className="text-xs opacity-75">Fast loading, lower memory</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('full')}
                className="flex-1 px-4 py-3 rounded-lg transition-all font-medium text-sm"
                style={{
                  backgroundColor: previewMode === 'full' ? currentTheme.colors.accent : currentTheme.colors.surface,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: previewMode === 'full' ? currentTheme.colors.accent : currentTheme.colors.border,
                  color: previewMode === 'full' ? '#ffffff' : currentTheme.colors.text.primary,
                }}
                data-testid="preview-mode-full-btn"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    <span className="font-bold">Full Rendering</span>
                  </div>
                  <span className="text-xs opacity-75">Accurate visuals, high fidelity</span>
                </div>
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: currentTheme.colors.text.tertiary }}>
              {previewMode === 'lightweight'
                ? 'Lightweight mode uses DOM snapshots for quick previews with minimal resource usage.'
                : 'Full rendering mode captures actual screenshots for precise visual feedback.'}
            </p>
          </div>

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
