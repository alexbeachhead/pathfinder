'use client';

import { useState } from 'react';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { TestCodeEditor } from './TestCodeEditor';
import { ScreenshotPreview } from './ScreenshotPreview';
import { ScenarioPreview } from './ScenarioPreview';
import { ScreenshotMetadata, TestScenario, CodeLanguage, MascotConfig } from '@/lib/types';
import { createTestSuite, saveTestCode } from '@/lib/supabase/testSuites';
import { getOrCreateDefaultBranch, createSnapshot } from '@/lib/supabase/branches';
import { saveSuiteScreenshots, saveTestScenarios } from '@/lib/supabase/suiteAssets';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { Code, PlusIcon, Image, FileText } from 'lucide-react';

interface StepReviewProps {
  screenshots: ScreenshotMetadata[];
  scenarios: TestScenario[];
  generatedCode: string;
  codeLanguage: CodeLanguage;
  targetUrl?: string;
  testSuiteName: string;
  description: string;
  mascotConfig: MascotConfig;
  onCodeChange: (code: string) => void;
  onSaveComplete: (suiteId: string, branchId: string) => void;
  onSaveError: (error: string) => void;
  onReset: () => void;
  onReloadSuites: () => void;
}

// Helper function to save screenshots
async function saveScreenshotsIfAvailable(suiteId: string, screenshots: ScreenshotMetadata[]) {
  if (screenshots && screenshots.length > 0) {
    try {
      await saveSuiteScreenshots(suiteId, screenshots);
    } catch (error) {
      // Don't fail the entire save if screenshots fail
    }
  }
}

// Helper function to save scenarios
async function saveScenariosIfAvailable(suiteId: string, scenarios: TestScenario[]) {
  if (scenarios && scenarios.length > 0) {
    try {
      await saveTestScenarios(suiteId, scenarios);
    } catch (error) {
      // Don't fail the entire save if scenarios fail
    }
  }
}

// Helper function to create snapshot
async function createBranchSnapshot(
  suiteId: string,
  branchId: string,
  testSuiteName: string,
  targetUrl: string,
  description: string
) {
  const { data: latestCode } = await fetch(`/api/supabase/test-code/${suiteId}/latest`)
    .then(r => r.json())
    .catch(() => ({ data: null }));

  if (latestCode) {
    await createSnapshot({
      branch_id: branchId,
      test_code_id: latestCode.id,
      suite_config: {
        name: testSuiteName,
        target_url: targetUrl,
        description,
      },
    });
  }
}

export function StepReview({
  screenshots,
  scenarios,
  generatedCode,
  codeLanguage,
  targetUrl = '',
  testSuiteName,
  description,
  mascotConfig,
  onCodeChange,
  onSaveComplete,
  onSaveError,
  onReset,
  onReloadSuites,
}: StepReviewProps) {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'screenshots' | 'scenarios' | 'code'>('screenshots');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTests = async () => {
    try {
      setIsSaving(true);

      // Create test suite
      const suiteId = await createTestSuite({
        name: testSuiteName,
        target_url: targetUrl,
        description,
      });

      // Ensure default branch exists
      const defaultBranch = await getOrCreateDefaultBranch(suiteId);

      // Save test code with language preference
      await saveTestCode(suiteId, generatedCode, codeLanguage);

      // Save screenshots and scenarios
      await saveScreenshotsIfAvailable(suiteId, screenshots);
      await saveScenariosIfAvailable(suiteId, scenarios);

      // Create snapshot for the branch
      await createBranchSnapshot(suiteId, defaultBranch.id, testSuiteName, targetUrl, description);

      // Reload suites list to include newly created suite
      onReloadSuites();

      // Notify parent of successful save
      onSaveComplete(suiteId, defaultBranch.id);
    } catch (err) {
      onSaveError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b" style={{ borderColor: currentTheme.colors.border }}>
        {screenshots.length > 0 && (
          <button
            onClick={() => setActiveTab('screenshots')}
            className="flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all relative"
            style={{
              color: activeTab === 'screenshots' ? currentTheme.colors.accent : currentTheme.colors.text.secondary,
            }}
            data-testid="screenshots-tab-btn"
          >
            <Image size={16} />
            Screenshots
            {activeTab === 'screenshots' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: currentTheme.colors.accent }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        )}
        {scenarios && scenarios.length > 0 && (
          <button
            onClick={() => setActiveTab('scenarios')}
            className="flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all relative"
            style={{
              color: activeTab === 'scenarios' ? currentTheme.colors.accent : currentTheme.colors.text.secondary,
            }}
            data-testid="scenarios-tab-btn"
          >
            <FileText size={16} />
            Test Scenarios
            {activeTab === 'scenarios' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: currentTheme.colors.accent }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        )}
        {generatedCode && (
          <>
            <button
              onClick={() => setActiveTab('code')}
              className="flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all relative"
              style={{
                color: activeTab === 'code' ? currentTheme.colors.accent : currentTheme.colors.text.secondary,
              }}
              data-testid="code-tab-btn"
            >
              <Code size={16} />
              Generated Code
              {activeTab === 'code' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: currentTheme.colors.accent }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          </>
        )}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'screenshots' && screenshots.length > 0 && (
          <ScreenshotPreview screenshots={screenshots} />
        )}
        {activeTab === 'scenarios' && scenarios && scenarios.length > 0 && (
          <ScenarioPreview scenarios={scenarios} />
        )}
        {activeTab === 'code' && generatedCode && (
          <TestCodeEditor code={generatedCode} language={codeLanguage} onChange={onCodeChange} />
        )}
      </motion.div>

      <div className="flex items-center gap-4">
        <ThemedButton variant="secondary" size="lg" onClick={onReset} disabled={isSaving} data-testid="start-over-btn">
          <PlusIcon /> New
        </ThemedButton>
        <ThemedButton
          variant="glow"
          size="lg"
          fullWidth
          onClick={handleSaveTests}
          isLoading={isSaving}
          data-testid="save-test-suite-btn"
        >
          {isSaving ? 'Saving...' : 'Save Test Suite'}
        </ThemedButton>
      </div>
    </div>
  );
}
